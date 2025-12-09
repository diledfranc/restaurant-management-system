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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Orders</h2>
                        <p className="text-sm text-muted-foreground">Manage and update order statuses.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    {statusOptions.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {statusLabels[s]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => router.reload({ only: ['orders'] })}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {renderedOrders.map((order) => {
                        const isLoading = loadingIds.includes(order.id);
                        return (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Placed {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{statusLabels[order.status] ?? order.status}</Badge>
                                        <Badge>{formatCurrency(order.total_cents)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                            <p className="font-semibold">Customer</p>
                                            <p>{order.user?.name || order.guest_name || 'Guest'}</p>
                                            <p className="text-muted-foreground">{order.user?.phone || order.guest_phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Delivery</p>
                                            <p>{order.guest_address || 'Pickup / not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold">Items</p>
                                        <div className="rounded-lg border">
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between border-b px-3 py-2 last:border-b-0">
                                                    <div>
                                                        <p className="font-medium">{item.menu_item.name}</p>
                                                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold">{formatCurrency(item.total_price_cents)}</p>
                                                </div>
                                            )) || <div className="p-3 text-sm text-muted-foreground">No items</div>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Label className="text-sm">Status</Label>
                                            <Select
                                                defaultValue={order.status}
                                                onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {statusLabels[s]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={isLoading}
                                                onClick={() => router.reload({ only: ['orders'] })}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                disabled={isLoading}
                                                onClick={() => handleDelete(order.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
