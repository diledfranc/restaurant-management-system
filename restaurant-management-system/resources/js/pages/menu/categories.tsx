import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '#' },
    { title: 'Categories', href: '#' },
];

export default function MenuCategoriesPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Categories" />
            <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
                    {loading ? (
                        <Spinner />
                    ) : categories.length === 0 ? (
                        <div className="rounded-xl border p-4 text-center">No categories found.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((cat) => (
                                <Card key={cat.id}>
                                    <CardHeader>
                                        <CardTitle>{cat.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                <div className="relative mt-4 min-h-[40vh] overflow-hidden rounded-xl border p-4">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}

    import { useEffect, useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Spinner } from '@/components/ui/spinner';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Menu', href: '/menu' },
        { title: 'Categories', href: '/menu/categories' },
    ];

    interface MenuCategory {
        id: number;
        name: string;
    }

    export default function MenuCategoriesPage() {
        const [categories, setCategories] = useState<MenuCategory[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchCategories = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/categories');
                    if (response.ok) {
                        const data = await response.json();
                        setCategories(Array.isArray(data?.data) ? data.data : data);
                    }
                } catch (error) {
                    // handle error
                } finally {
                    setLoading(false);
                }
            };
            fetchCategories();
        }, []);

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Menu Categories" />
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
                    {loading ? (
                        <Spinner />
                    ) : categories.length === 0 ? (
                        <div className="rounded-xl border p-4 text-center">No categories found.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((cat) => (
                                <Card key={cat.id}>
                                    <CardHeader>
                                        <CardTitle>{cat.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
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
