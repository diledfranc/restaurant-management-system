import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Archive, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReceiveStockDialog from './receive-stock-dialog';
import LogWasteDialog from './log-waste-dialog';

interface IngredientBatch {
    id: number;
    batch_number: string | null;
    quantity: number;
    expiration_date: string | null;
    received_at: string;
}

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    reorder_level: number;
    cost_per_unit_cents: number;
    batches?: IngredientBatch[];
}

export default function InventoryIndex({ ingredients }: { ingredients: Ingredient[] }) {
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [receivingIngredient, setReceivingIngredient] = useState<Ingredient | null>(null);
    const [wastingIngredient, setWastingIngredient] = useState<Ingredient | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    const filteredIngredients = showLowStockOnly 
        ? ingredients.filter(i => i.current_stock <= i.reorder_level)
        : ingredients;

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        unit: '',
        current_stock: 0,
        reorder_level: 10,
        cost_per_unit_cents: 0,
    });

    const openCreate = () => {
        setEditingIngredient(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEdit = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setData({
            name: ingredient.name,
            unit: ingredient.unit,
            current_stock: ingredient.current_stock,
            reorder_level: ingredient.reorder_level,
            cost_per_unit_cents: ingredient.cost_per_unit_cents,
        });
        setIsDialogOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIngredient) {
            put(route('inventory.update', editingIngredient.id), {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            post(route('inventory.store'), {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const deleteIngredient = (id: number) => {
        if (confirm('Are you sure? This will remove the ingredient from all recipes.')) {
            destroy(route('inventory.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Inventory', href: '/inventory' }]}>
            <Head title="Inventory" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                        <p className="text-muted-foreground">Track ingredients and stock levels.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant={showLowStockOnly ? "destructive" : "outline"}
                            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                        >
                            {showLowStockOnly ? "Show All" : "Show Low Stock"}
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Ingredient
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ingredients</CardTitle>
                        <CardDescription>
                            Manage your stock items and reorder levels.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Reorder Level</TableHead>
                                    <TableHead>Cost / Unit</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIngredients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No ingredients found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredIngredients.map((ingredient) => (
                                    <TableRow key={ingredient.id} className={ingredient.current_stock <= ingredient.reorder_level ? "bg-red-50" : ""}>
                                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                                        <TableCell>{ingredient.unit}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {ingredient.current_stock}
                                                {ingredient.current_stock <= ingredient.reorder_level && (
                                                    <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{ingredient.reorder_level}</TableCell>
                                        <TableCell>{(ingredient.cost_per_unit_cents / 100).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" title="Receive Stock" onClick={() => setReceivingIngredient(ingredient)}>
                                                    <Archive className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" title="Log Waste" onClick={() => setWastingIngredient(ingredient)}>
                                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(ingredient)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteIngredient(ingredient.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="e.g. Coffee Beans"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <Input 
                                    id="unit" 
                                    value={data.unit} 
                                    onChange={e => setData('unit', e.target.value)} 
                                    placeholder="e.g. kg, liters, pcs"
                                    required
                                />
                                {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Current Stock</Label>
                                    <Input 
                                        id="stock" 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={data.current_stock} 
                                        onChange={e => setData('current_stock', parseFloat(e.target.value))} 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reorder">Reorder Level</Label>
                                    <Input 
                                        id="reorder" 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={data.reorder_level} 
                                        onChange={e => setData('reorder_level', parseFloat(e.target.value))} 
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost per Unit (Cents)</Label>
                                <Input 
                                    id="cost" 
                                    type="number" 
                                    min="0"
                                    value={data.cost_per_unit_cents} 
                                    onChange={e => setData('cost_per_unit_cents', parseInt(e.target.value))} 
                                    required
                                />
                                <p className="text-xs text-muted-foreground">{(data.cost_per_unit_cents / 100).toFixed(2)} currency units</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {editingIngredient ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <ReceiveStockDialog 
                    ingredient={receivingIngredient} 
                    isOpen={!!receivingIngredient} 
                    onClose={() => setReceivingIngredient(null)} 
                />

                <LogWasteDialog 
                    ingredient={wastingIngredient} 
                    isOpen={!!wastingIngredient} 
                    onClose={() => setWastingIngredient(null)} 
                />
            </div>
        </AppLayout>
    );
}
