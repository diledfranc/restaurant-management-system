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
        meta: {
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    };
    categories: MenuCategory[];
    filters: {
        category?: string;
    };
}

export default function MenuIndex() {
    const { items, categories, filters } = usePage<MenuPageProps>().props;
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
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

    // Category management state
    const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryProcessing, setCategoryProcessing] = useState(false);

    const getCsrfToken = (): string => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; XSRF-TOKEN=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const price_cents = Math.round(parseFloat(formData.price_cents) * 100);
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/menu-items/${editingId}` : '/api/menu-items';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ ...formData, price_cents }),
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
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
                router.reload();
            } else {
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

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setCategoryProcessing(true);
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ name: newCategoryName }),
            });

            if (response.ok) {
                setNewCategoryName('');
                router.reload({ only: ['categories'] });
            }
        } catch (error) {
            console.error('Error adding category:', error);
        } finally {
            setCategoryProcessing(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Delete this category? Items in this category may become uncategorized.')) return;
        setCategoryProcessing(true);
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            if (response.ok) {
                router.reload({ only: ['categories', 'items'] });
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        } finally {
            setCategoryProcessing(false);
        }
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
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setManageCategoriesOpen(true)}>
                            Manage Categories
                        </Button>
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
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={!filters.category ? "default" : "outline"}
                        onClick={() => router.get('/menu')}
                        size="sm"
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={filters.category == String(cat.id) ? "default" : "outline"}
                            onClick={() => router.get('/menu', { category: String(cat.id) })}
                            size="sm"
                        >
                            {cat.name}
                        </Button>
                    ))}
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

                {items.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {items.meta.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

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

                <Dialog open={manageCategoriesOpen} onOpenChange={setManageCategoriesOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Manage Categories</DialogTitle>
                            <DialogDescription>
                                Add or remove menu categories.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <form onSubmit={handleAddCategory} className="flex gap-2">
                                <Input
                                    placeholder="New category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    disabled={categoryProcessing}
                                />
                                <Button type="submit" disabled={categoryProcessing || !newCategoryName.trim()}>
                                    {categoryProcessing ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {categories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p>
                                ) : (
                                    categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
                                            <span className="font-medium">{cat.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                disabled={categoryProcessing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
