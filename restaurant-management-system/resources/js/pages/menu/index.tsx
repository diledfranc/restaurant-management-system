import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { Trash2, Edit, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '/menu' },
];

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    category_id: number;
    image_path?: string;
    created_at: string;
}

interface MenuPageProps {
    items: {
        data: MenuItem[];
        current_page: number;
        last_page: number;
    };
}

export default function MenuIndex() {
    const { items } = usePage<MenuPageProps>().props;
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/menu-items/${editingId}` : '/api/menu-items';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.errors || {});
            } else {
                setOpen(false);
                setFormData({ name: '', description: '', price: '', category_id: '' });
                setEditingId(null);
                router.reload();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            try {
                const response = await fetch(`/api/menu-items/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    router.reload();
                }
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Menu Items</h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', description: '', price: '', category_id: '' });
                                setErrors({});
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Edit' : 'Create'} Menu Item</DialogTitle>
                                <DialogDescription>Fill in the menu item details below.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    {errors.name && <InputError message={errors.name} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    {errors.description && <InputError message={errors.description} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                    {errors.price && <InputError message={errors.price} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">Category ID</Label>
                                    <Input
                                        id="category_id"
                                        type="number"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    />
                                    {errors.category_id && <InputError message={errors.category_id} />}
                                </div>
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading && <Spinner />}
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.data.length > 0 ? (
                        items.data.map((item) => (
                            <Card key={item.id}>
                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {item.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                    )}
                                    <p className="text-lg font-bold">${parseFloat(String(item.price)).toFixed(2)}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                setEditingId(item.id);
                                                setFormData({
                                                    name: item.name,
                                                    description: item.description || '',
                                                    price: String(item.price),
                                                    category_id: String(item.category_id),
                                                });
                                                setOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">No menu items yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
