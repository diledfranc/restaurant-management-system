import { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
];

type OrderItem = {
    id: number;
    menu_item: {
        id: number;
        name: string;
        price_cents: number;
    };
    quantity: number;
    total_price_cents: number;
    notes?: string;
};

type Order = {
    id: number;
    user?: {
        id: number;
        name: string;
        phone?: string;
    } | null;
    guest_name?: string | null;
    guest_phone?: string | null;
    guest_address?: string | null;
    total_cents: number;
    payment_method: string;
    status: string;
    assigned_to?: {
        id: number;
        name: string;
    } | null;
    items?: OrderItem[];
    created_at: string;
};

type OrdersPageProps = {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        from?: number;
        to?: number;
        total?: number;
    };
    filters: {
        status?: string;
        assigned_to?: string;
    };
};

const statusLabels: Record<string, string> = {
    placed: 'Placed',
    preparing: 'Preparing',
    ready: 'Ready',
    on_way: 'On the way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const statusOptions = Object.keys(statusLabels);

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function OrdersIndex() {
    const { orders, filters } = usePage<OrdersPageProps>().props;
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/orders',
            { status: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStatusUpdate = async (orderId: number, nextStatus: string) => {
        setLoadingIds((ids) => [...ids, orderId]);
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (response.ok) {
                router.reload({ only: ['orders'] });
            }
        } finally {
            setLoadingIds((ids) => ids.filter((id) => id !== orderId));
        }
    };

    const handleDelete = async (orderId: number) => {
        if (!confirm('Delete this order?')) return;
        setLoadingIds((ids) => [...ids, orderId]);
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (response.ok) {
                router.reload({ only: ['orders'] });
            }
        } finally {
            setLoadingIds((ids) => ids.filter((id) => id !== orderId));
        }
    };

    const renderedOrders = useMemo(() => orders.data, [orders]);

    return (
        const [orders, setOrders] = useState<Order[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchOrders = async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/orders');
                    if (response.ok) {
                        const data = await response.json();
                        setOrders(Array.isArray(data?.data) ? data.data : data);
                    }
                } catch (error) {
                    // handle error
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }, []);

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Orders" />
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Orders</h2>
                    {loading ? (
                        <Spinner />
                    ) : orders.length === 0 ? (
                        <div className="rounded-xl border p-4 text-center">No orders found.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <Card key={order.id}>
                                    <CardHeader>
                                        <CardTitle>Order #{order.id}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-2">Customer: {order.customer_name}</p>
                                        <p className="mb-2">Status: {order.status}</p>
                                        <p className="mb-2">Total: ${(order.total_cents / 100).toFixed(2)}</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">View</Button>
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
    );
}
