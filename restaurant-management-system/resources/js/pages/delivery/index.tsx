

import { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Delivery', href: '/delivery' },
];

interface Delivery {
    id: number;
    status: string;
    created_at: string;
    pickup_time?: string;
    delivered_time?: string;
    order?: {
        id: number;
        total_cents: number;
        status: string;
    };
    assigned_user?: {
        name: string;
    };
}

interface DeliveryPageProps {
    deliveries: {
        data: Delivery[];
    };
}

const statusOptions = ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'];
const statusLabels: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const formatCurrency = (cents?: number) => {
    if (cents === undefined) return '—';
    return `฿${(cents / 100).toFixed(2)}`;
};

export default function DeliveryPage() {
    const { deliveries } = usePage<DeliveryPageProps>().props;
    const [statusFilter, setStatusFilter] = useState('');
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const renderedDeliveries = useMemo(() => {
        if (!statusFilter || statusFilter === 'all') return deliveries.data;
        return deliveries.data.filter((d) => d.status === statusFilter);
    }, [deliveries.data, statusFilter]);

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleStatusUpdate = async (deliveryId: number, nextStatus: string) => {
        setLoadingIds((ids) => [...ids, deliveryId]);
        try {
            const response = await fetch(`/api/deliveries/${deliveryId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (response.ok) {
                router.reload({ only: ['deliveries'] });
            }
        } finally {
            setLoadingIds((ids) => ids.filter((id) => id !== deliveryId));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Delivery" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Deliveries</h2>
                        <p className="text-sm text-muted-foreground">Track delivery assignments and statuses.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {statusOptions.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {statusLabels[s]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => router.reload({ only: ['deliveries'] })}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {renderedDeliveries.map((delivery) => {
                        const isLoading = loadingIds.includes(delivery.id);
                        return (
                            <Card key={delivery.id} className="overflow-hidden">
                                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">Delivery #{delivery.id}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Created {new Date(delivery.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{statusLabels[delivery.status] ?? delivery.status}</Badge>
                                        <Badge>{formatCurrency(delivery.order?.total_cents)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                            <p className="font-semibold">Assigned</p>
                                            <p>{delivery.assigned_user?.name || 'Unassigned'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Order</p>
                                            <p>Order #{delivery.order?.id ?? '—'}</p>
                                            <p className="text-muted-foreground">Status: {delivery.order?.status ?? 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                            <p className="font-semibold">Pickup time</p>
                                            <p>{delivery.pickup_time ? new Date(delivery.pickup_time).toLocaleString() : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Delivered time</p>
                                            <p>{delivery.delivered_time ? new Date(delivery.delivered_time).toLocaleString() : '—'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Label className="text-sm">Status</Label>
                                            <Select
                                                defaultValue={delivery.status}
                                                onValueChange={(value) => handleStatusUpdate(delivery.id, value)}
                                                disabled={isLoading}
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

