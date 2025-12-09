import { useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '__all');
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        const statusParam = value === '__all' ? undefined : value;
        router.get(
            '/orders',
            { status: statusParam },
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

    const renderedOrders = useMemo(() => orders?.data ?? [], [orders]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="space-y-6 p-4 lg:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Orders</h1>
                        <p className="text-sm text-muted-foreground">Track orders, update status, and manage fulfillment.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.reload({ only: ['orders'] })}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <div className="w-44">
                            <Label className="sr-only" htmlFor="status-filter">Status filter</Label>
                            <Select value={statusFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger id="status-filter" aria-label="Status filter">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all">All statuses</SelectItem>
                                    {statusOptions.map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {statusLabels[value] ?? value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {renderedOrders.length === 0 ? (
                    <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
                        No orders found for the current filter.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {renderedOrders.map((order) => {
                            const isLoading = loadingIds.includes(order.id);
                            return (
                                <Card key={order.id} className="border-border/70">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">{statusLabels[order.status] ?? order.status}</Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="font-medium">Customer</p>
                                            {order.user ? (
                                                <p>{order.user.name} {order.user.phone ? `• ${order.user.phone}` : ''}</p>
                                            ) : (
                                                <p>{order.guest_name ?? 'Guest'} {order.guest_phone ? `• ${order.guest_phone}` : ''}</p>
                                            )}
                                            {order.guest_address && <p className="text-muted-foreground">{order.guest_address}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between font-medium">
                                                <span>Items</span>
                                                <span>{formatCurrency(order.total_cents)}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-muted-foreground">
                                                        <span>{item.menu_item.name} × {item.quantity}</span>
                                                        <span>{formatCurrency(item.total_price_cents)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Payment</Label>
                                                    <p className="font-medium">{order.payment_method || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Assigned to</Label>
                                                    <p className="font-medium">{order.assigned_to?.name ?? 'Unassigned'}</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label className="text-xs text-muted-foreground">Update status</Label>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map((value) => (
                                                            <SelectItem key={value} value={value}>
                                                                {statusLabels[value] ?? value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                            >
                                                <Link href={`/orders/${order.id}`}>View details</Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={() => handleDelete(order.id)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
