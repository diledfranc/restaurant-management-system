import { useState, useEffect } from 'react';
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
    DialogClose,
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
    price_cents: number;
    category_id: number;
    is_available: boolean;
    image_path?: string;
    created_at: string;
}

interface MenuCategory {
    id: number;
    name: string;
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
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_cents: '',
        category_id: '',
        is_available: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(Array.isArray(data?.data) ? data.data : data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Convert price to cents if needed
        const price_cents = Math.round(parseFloat(formData.price_cents) * 100);

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/menu-items/${editingId}` : '/api/menu-items';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...formData,
                    price_cents,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.errors || {});
            } else {
                setOpen(false);
                setFormData({
                    name: '',
                    description: '',
                    price_cents: '',
                    category_id: '',
                    is_available: true,
                });
                setEditingId(null);
                router.reload();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete === null) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/menu-items/${itemToDelete}`, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
                router.reload();
            } else {
                console.error('Error deleting item:', response.statusText);
                alert('Failed to delete menu item. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('An error occurred while deleting the menu item.');
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description || '',
            price_cents: String(item.price_cents / 100),
            category_id: String(item.category_id),
            is_available: item.is_available,
        });
        setOpen(true);
    };

    const handleNewItem = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            price_cents: '',
            category_id: '',
            is_available: true,
        });
        setErrors({});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Menu Items</h2>
                        <p className="text-sm text-muted-foreground">Manage your restaurant menu</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleNewItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Edit' : 'Create'} Menu Item</DialogTitle>
                                <DialogDescription>
                                    {editingId ? 'Update the menu item details.' : 'Add a new menu item to your restaurant.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Grilled Salmon"
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
                                        placeholder="e.g., Fresh salmon fillet with lemon butter sauce"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    {errors.description && <InputError message={errors.description} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_cents">Price ($) *</Label>
                                    <Input
                                        id="price_cents"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.price_cents}
                                        onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                                        required
                                    />
                                    {errors.price_cents && <InputError message={errors.price_cents} />}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">Category *</Label>
                                    <select
                                        id="category_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Select a category --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <InputError message={errors.category_id} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_available" className="cursor-pointer">
                                        Available
                                    </Label>
                                </div>
                                {errors.general && <InputError message={errors.general} />}
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Spinner /> Processing...
                                        </>
                                    ) : (
                                        editingId ? 'Update Item' : 'Create Item'
                                    )}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.data.length > 0 ? (
                        items.data.map((item) => (
                            <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="line-clamp-2">{item.name}</CardTitle>
                                        {!item.is_available && (
                                            <span className="text-xs font-semibold text-gray-500">Unavailable</span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {item.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                    )}
                                    <p className="text-2xl font-bold">${(item.price_cents / 100).toFixed(2)}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border border-dashed p-8 text-center">
                            <p className="text-lg font-medium">No menu items yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">Create your first menu item to get started!</p>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Delete Menu Item</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this menu item? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 justify-end pt-4">
                            <DialogClose asChild>
                                <Button variant="outline" disabled={deleting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Spinner /> Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
