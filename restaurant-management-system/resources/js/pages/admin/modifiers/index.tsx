import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Modifier {
    id: number;
    name: string;
    price_cents: number;
    is_available: boolean;
}

interface ModifierGroup {
    id: number;
    name: string;
    internal_name: string;
    min_selection: number;
    max_selection: number;
    is_active: boolean;
    modifiers: Modifier[];
}

export default function ModifiersIndex({ groups }: { groups: ModifierGroup[] }) {
    const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        internal_name: '',
        min_selection: 0,
        max_selection: 1,
        is_active: true,
    });

    const openCreateGroup = () => {
        setEditingGroup(null);
        reset();
        setIsGroupDialogOpen(true);
    };

    const openEditGroup = (group: ModifierGroup) => {
        setEditingGroup(group);
        setData({
            name: group.name,
            internal_name: group.internal_name || '',
            min_selection: group.min_selection,
            max_selection: group.max_selection,
            is_active: Boolean(group.is_active),
        });
        setIsGroupDialogOpen(true);
    };

    const submitGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGroup) {
            put(route('modifiers.update', editingGroup.id), {
                onSuccess: () => setIsGroupDialogOpen(false),
            });
        } else {
            post(route('modifiers.store'), {
                onSuccess: () => setIsGroupDialogOpen(false),
            });
        }
    };

    const deleteGroup = (id: number) => {
        if (confirm('Are you sure? This will delete all modifiers in this group.')) {
            destroy(route('modifiers.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Modifiers', href: '/modifiers' }]}>
            <Head title="Modifiers" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Modifier Groups</h1>
                        <p className="text-muted-foreground">Manage customization options for your menu items.</p>
                    </div>
                    <Button onClick={openCreateGroup}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Group
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => (
                        <ModifierGroupCard 
                            key={group.id} 
                            group={group} 
                            onEdit={() => openEditGroup(group)}
                            onDelete={() => deleteGroup(group.id)}
                        />
                    ))}
                </div>

                <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGroup ? 'Edit Group' : 'Create Group'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitGroup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="e.g. Milk Option"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="internal_name">Internal Name (Optional)</Label>
                                <Input 
                                    id="internal_name" 
                                    value={data.internal_name} 
                                    onChange={e => setData('internal_name', e.target.value)} 
                                    placeholder="e.g. milk_type"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min">Min Selection</Label>
                                    <Input 
                                        id="min" 
                                        type="number" 
                                        min="0"
                                        value={data.min_selection} 
                                        onChange={e => setData('min_selection', parseInt(e.target.value))} 
                                    />
                                    <p className="text-xs text-muted-foreground">0 = Optional</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max">Max Selection</Label>
                                    <Input 
                                        id="max" 
                                        type="number" 
                                        min="1"
                                        value={data.max_selection} 
                                        onChange={e => setData('max_selection', parseInt(e.target.value))} 
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="active" 
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    {editingGroup ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

function ModifierGroupCard({ group, onEdit, onDelete }: { group: ModifierGroup, onEdit: () => void, onDelete: () => void }) {
    const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
    const [editingModifier, setEditingModifier] = useState<Modifier | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        price_cents: 0,
        is_available: true,
    });

    const openCreateModifier = () => {
        setEditingModifier(null);
        reset();
        setIsModifierDialogOpen(true);
    };

    const openEditModifier = (modifier: Modifier) => {
        setEditingModifier(modifier);
        setData({
            name: modifier.name,
            price_cents: modifier.price_cents,
            is_available: Boolean(modifier.is_available),
        });
        setIsModifierDialogOpen(true);
    };

    const submitModifier = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingModifier) {
            put(route('modifiers.items.update', [group.id, editingModifier.id]), {
                onSuccess: () => setIsModifierDialogOpen(false),
            });
        } else {
            post(route('modifiers.items.store', group.id), {
                onSuccess: () => setIsModifierDialogOpen(false),
            });
        }
    };

    const deleteModifier = (id: number) => {
        if (confirm('Delete this option?')) {
            destroy(route('modifiers.items.destroy', [group.id, id]));
        }
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
                    <CardDescription>
                        {group.min_selection === 0 ? 'Optional' : `Required (Min ${group.min_selection})`} • Max {group.max_selection}
                    </CardDescription>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-2">
                    {group.modifiers.map(modifier => (
                        <div key={modifier.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={!modifier.is_available ? 'text-muted-foreground line-through' : ''}>
                                    {modifier.name}
                                </span>
                                {modifier.price_cents > 0 && (
                                    <Badge variant="secondary">+{modifier.price_cents / 100}</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditModifier(modifier)}>
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteModifier(modifier.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" onClick={openCreateModifier}>
                        <Plus className="mr-2 h-3 w-3" /> Add Option
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModifier ? 'Edit Option' : 'Add Option'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitModifier} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mod_name">Name</Label>
                            <Input 
                                id="mod_name" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                placeholder="e.g. Oat Milk"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Additional Price (Cents)</Label>
                            <Input 
                                id="price" 
                                type="number" 
                                min="0"
                                value={data.price_cents} 
                                onChange={e => setData('price_cents', parseInt(e.target.value))} 
                            />
                            <p className="text-xs text-muted-foreground">{(data.price_cents / 100).toFixed(2)} currency units</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="mod_avail" 
                                checked={data.is_available}
                                onCheckedChange={(checked) => setData('is_available', checked)}
                            />
                            <Label htmlFor="mod_avail">Available</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing}>
                                {editingModifier ? 'Update' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
