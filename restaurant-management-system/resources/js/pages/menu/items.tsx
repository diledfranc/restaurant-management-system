
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '/menu' },
    { title: 'Items', href: '/menu/items' },
];

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price_cents: number;
    is_available: boolean;
}

export default function MenuItemsPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/menu-items');
                if (response.ok) {
                    const data = await response.json();
                    setItems(Array.isArray(data?.data) ? data.data : data);
                }
            } catch (error) {
                // optionally surface error to user
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const handleDelete = (id: number) => {
        if (!confirm('Delete this menu item?')) return;
        setDeletingIds((ids) => [...ids, id]);
        
        // Get CSRF token from cookie or meta tag
        const getCookie = (name: string): string => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
            return document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '';
        };

        const csrfToken = getCookie('XSRF-TOKEN');

        fetch(`/api/menu-items/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': csrfToken,
            },
        })
            .then((response) => {
                if (response.ok) {
                    setItems((prev) => prev.filter((item) => item.id !== id));
                } else {
                    console.error('Delete failed:', response.status);
                }
            })
            .catch((error) => {
                console.error('Delete error:', error);
            })
            .finally(() => {
                setDeletingIds((ids) => ids.filter((itemId) => itemId !== id));
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Items" />
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
                {loading ? (
                    <Spinner />
                ) : items.length === 0 ? (
                    <div className="rounded-xl border p-4 text-center">No menu items found.</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <CardTitle>{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                                    <p className="text-lg font-bold mb-2">${(item.price_cents / 100).toFixed(2)}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Edit</Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={deletingIds.includes(item.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                 </CardContent>
                             </Card>
                         ))}
                     </div>
                 )}
             </div>
         </AppLayout>
     );
 }
