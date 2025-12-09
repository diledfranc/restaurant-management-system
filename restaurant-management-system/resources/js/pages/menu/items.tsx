
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

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
                                        <Button variant="destructive" size="sm">Delete</Button>
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
