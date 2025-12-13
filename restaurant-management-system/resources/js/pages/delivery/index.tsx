

import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, MapPin, Phone, User, Truck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Delivery', href: '/delivery' },
];

interface Delivery {
    id: number;
    status: string;
    created_at: string;
    pickup_time?: string;
    delivered_time?: string;
    order: {
        id: number;
        total_cents: number;
        status: string;
        guest_name: string;
        guest_phone: string;
        guest_address: string;
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

const formatCurrency = (cents?: number) => {
    if (cents === undefined) return '—';
    return `฿${(cents / 100).toFixed(2)}`;
};

export default function DeliveryPage() {
    const { deliveries } = usePage<DeliveryPageProps>().props;
    const [loadingIds, setLoadingIds] = useState<number[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['deliveries'], preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ 
            only: ['deliveries'], 
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false)
        });
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
                router.reload({ only: ['deliveries'], preserveScroll: true });
            }
        } finally {
            setLoadingIds((ids) => ids.filter((id) => id !== deliveryId));
        }
    };

    const activeDeliveries = deliveries.data.filter(d => ['pending', 'assigned', 'picked_up'].includes(d.status));
    const historyDeliveries = deliveries.data.filter(d => ['delivered', 'cancelled'].includes(d.status));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Delivery Management" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
                        <p className="text-muted-foreground">Manage active deliveries and view history.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">Active Deliveries ({activeDeliveries.length})</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {activeDeliveries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-muted/10 text-muted-foreground">
                                <Truck className="h-12 w-12 mb-4 opacity-20" />
                                <p>No active deliveries at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {activeDeliveries.map((delivery) => (
                                    <DeliveryCard 
                                        key={delivery.id} 
                                        delivery={delivery} 
                                        loading={loadingIds.includes(delivery.id)}
                                        onUpdateStatus={handleStatusUpdate}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {historyDeliveries.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">No delivery history found.</div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {historyDeliveries.map((delivery) => (
                                    <DeliveryCard 
                                        key={delivery.id} 
                                        delivery={delivery} 
                                        loading={loadingIds.includes(delivery.id)}
                                        isHistory
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function DeliveryCard({ 
    delivery, 
    loading, 
    onUpdateStatus, 
    isHistory = false 
}: { 
    delivery: Delivery; 
    loading: boolean; 
    onUpdateStatus?: (id: number, status: string) => void;
    isHistory?: boolean;
}) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'assigned': return 'bg-blue-500';
            case 'picked_up': return 'bg-purple-500';
            case 'delivered': return 'bg-green-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.order.guest_address)}`;

    return (
        <Card className="flex flex-col overflow-hidden border-l-4" style={{ borderLeftColor: 'var(--border-l-color)' }}>
            <div className={`h-1 w-full ${getStatusColor(delivery.status)}`} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Order #{delivery.order.id}</CardTitle>
                        <p className="text-xs text-muted-foreground">{new Date(delivery.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant={delivery.status === 'cancelled' ? 'destructive' : 'outline'} className="capitalize">
                        {delivery.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <span className="font-medium">{delivery.order.guest_name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <a href={`tel:${delivery.order.guest_phone}`} className="hover:underline text-blue-600">
                            {delivery.order.guest_phone}
                        </a>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-sm">{delivery.order.guest_address}</p>
                            <a 
                                href={mapUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1"
                            >
                                Open in Maps <ArrowRightIcon className="h-3 w-3 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-lg">{formatCurrency(delivery.order.total_cents)}</span>
                </div>
                
                {delivery.assigned_user && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        Driver: <span className="font-medium text-foreground">{delivery.assigned_user.name}</span>
                    </div>
                )}
            </CardContent>
            
            {!isHistory && onUpdateStatus && (
                <CardFooter className="pt-2 gap-2">
                    {delivery.status === 'pending' && (
                        <Button 
                            className="w-full" 
                            onClick={() => onUpdateStatus(delivery.id, 'assigned')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Assign to Me'}
                        </Button>
                    )}
                    {delivery.status === 'assigned' && (
                        <Button 
                            className="w-full bg-purple-600 hover:bg-purple-700" 
                            onClick={() => onUpdateStatus(delivery.id, 'picked_up')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Pick Up Order'}
                        </Button>
                    )}
                    {delivery.status === 'picked_up' && (
                        <Button 
                            className="w-full bg-green-600 hover:bg-green-700" 
                            onClick={() => onUpdateStatus(delivery.id, 'delivered')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Mark Delivered'}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

function ArrowRightIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}

