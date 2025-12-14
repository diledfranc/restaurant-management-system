import { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table as TableType } from '@/types';
import { Plus, Save, Move, Trash2, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbs = [
    { title: 'Table Management', href: '/tables' },
];

export default function TablesIndex({ tables: initialTables }: { tables: TableType[] }) {
    const [tables, setTables] = useState<TableType[]>(initialTables);
    const [editMode, setEditMode] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
    
    // Form states
    const [formData, setFormData] = useState({
        table_number: '',
        capacity: '4',
        shape: 'square',
        status: 'available'
    });

    // Dragging state
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTables(initialTables);
    }, [initialTables]);

    const handleMouseDown = (e: React.MouseEvent, table: TableType) => {
        if (!editMode) return;
        e.preventDefault();
        setDraggingId(table.id);
        setDragOffset({
            x: e.clientX - table.position_x,
            y: e.clientY - table.position_y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingId === null) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Snap to grid (20px)
        const snappedX = Math.round(newX / 20) * 20;
        const snappedY = Math.round(newY / 20) * 20;

        setTables(tables.map(t => 
            t.id === draggingId ? { ...t, position_x: snappedX, position_y: snappedY } : t
        ));
    };

    const handleMouseUp = async () => {
        if (draggingId !== null) {
            const table = tables.find(t => t.id === draggingId);
            if (table) {
                // Save position
                try {
                    await fetch(`/tables/${table.id}/position`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                        },
                        body: JSON.stringify({
                            position_x: table.position_x,
                            position_y: table.position_y
                        })
                    });
                } catch (error) {
                    console.error('Failed to save position', error);
                }
            }
            setDraggingId(null);
        }
    };

    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/tables', {
            ...formData,
            capacity: parseInt(formData.capacity),
            position_x: 100,
            position_y: 100
        }, {
            onSuccess: () => {
                setIsAddDialogOpen(false);
                setFormData({ table_number: '', capacity: '4', shape: 'square', status: 'available' });
            }
        });
    };

    const handleEditTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTable) return;
        
        router.put(`/tables/${selectedTable.id}`, {
            ...formData,
            capacity: parseInt(formData.capacity)
        }, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedTable(null);
            }
        });
    };

    const handleDeleteTable = () => {
        if (!selectedTable) return;
        if (confirm('Are you sure you want to delete this table?')) {
            router.delete(`/tables/${selectedTable.id}`, {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedTable(null);
                }
            });
        }
    };

    const openEditDialog = (table: TableType) => {
        setSelectedTable(table);
        setFormData({
            table_number: table.table_number,
            capacity: table.capacity.toString(),
            shape: table.shape,
            status: table.status
        });
        setIsEditDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 border-green-500 text-green-700';
            case 'occupied': return 'bg-red-100 border-red-500 text-red-700';
            case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'dirty': return 'bg-gray-300 border-gray-600 text-gray-800';
            default: return 'bg-white border-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Table Management" />
            
            <div className="flex flex-col h-[calc(100vh-65px)]">
                <div className="p-4 border-b flex justify-between items-center bg-background">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold">Floor Plan</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Available</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Occupied</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Reserved</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-500 rounded-full"></div> Dirty</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={editMode ? "secondary" : "outline"} onClick={() => setEditMode(!editMode)}>
                            <Move className="w-4 h-4 mr-2" />
                            {editMode ? 'Done Editing' : 'Edit Layout'}
                        </Button>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Table
                        </Button>
                    </div>
                </div>

                <div 
                    ref={mapRef}
                    className="flex-1 bg-slate-50 relative overflow-hidden cursor-crosshair"
                    style={{ 
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {tables.map(table => (
                        <div
                            key={table.id}
                            className={cn(
                                "absolute flex flex-col items-center justify-center border-2 shadow-sm transition-colors select-none",
                                getStatusColor(table.status),
                                table.shape === 'round' ? 'rounded-full' : 'rounded-md',
                                editMode ? 'cursor-move hover:ring-2 ring-primary' : 'cursor-pointer hover:brightness-95'
                            )}
                            style={{
                                left: table.position_x,
                                top: table.position_y,
                                width: table.shape === 'rectangle' ? '120px' : '80px',
                                height: '80px',
                                zIndex: draggingId === table.id ? 10 : 1
                            }}
                            onMouseDown={(e) => handleMouseDown(e, table)}
                            onClick={() => !editMode && openEditDialog(table)}
                        >
                            <span className="font-bold text-lg">{table.table_number}</span>
                            <div className="flex items-center text-xs opacity-75">
                                <Users className="w-3 h-3 mr-1" />
                                {table.capacity}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Table</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTable} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="table_number">Table Number</Label>
                            <Input 
                                id="table_number" 
                                value={formData.table_number} 
                                onChange={e => setFormData({...formData, table_number: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input 
                                id="capacity" 
                                type="number" 
                                min="1"
                                value={formData.capacity} 
                                onChange={e => setFormData({...formData, capacity: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shape">Shape</Label>
                            <Select 
                                value={formData.shape} 
                                onValueChange={val => setFormData({...formData, shape: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="round">Round</SelectItem>
                                    <SelectItem value="rectangle">Rectangle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Table</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Table {selectedTable?.table_number}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditTable} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_table_number">Table Number</Label>
                            <Input 
                                id="edit_table_number" 
                                value={formData.table_number} 
                                onChange={e => setFormData({...formData, table_number: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_capacity">Capacity</Label>
                            <Input 
                                id="edit_capacity" 
                                type="number" 
                                min="1"
                                value={formData.capacity} 
                                onChange={e => setFormData({...formData, capacity: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_status">Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={val => setFormData({...formData, status: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="dirty">Dirty</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_shape">Shape</Label>
                            <Select 
                                value={formData.shape} 
                                onValueChange={val => setFormData({...formData, shape: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="square">Square</SelectItem>
                                    <SelectItem value="round">Round</SelectItem>
                                    <SelectItem value="rectangle">Rectangle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="flex justify-between sm:justify-between">
                            <Button type="button" variant="destructive" onClick={handleDeleteTable}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
