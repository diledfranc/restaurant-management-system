import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface OrderItem {
    id: number;
    menu_item: {
        name: string;
    };
    quantity: number;
    notes?: string;
}

interface Order {
    id: number;
    guest_name?: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function KitchenIndex() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kitchen/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId: number, status: string) => {
        try {
            const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchOrders(); // Refresh immediately
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return 'bg-yellow-500';
            case 'preparing': return 'bg-blue-500';
            case 'ready': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kitchen Display', href: '/kitchen' }]}>
            <Head title="Kitchen Display" />
            
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Kitchen Display System</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-xl bg-muted/10">
                        <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg">All caught up! No active orders.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => (
                            <Card key={order.id} className="border-2 overflow-hidden flex flex-col">
                                <div className={`h-2 w-full ${getStatusColor(order.status)}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">#{order.id}</CardTitle>
                                            <p className="font-medium text-muted-foreground">{order.guest_name || 'Guest'}</p>
                                        </div>
                                        <Badge variant={order.status === 'placed' ? 'destructive' : 'default'}>
                                            {order.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col gap-4">
                                    <div className="space-y-2 flex-1">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                                                <div className="font-medium">
                                                    <span className="text-lg font-bold mr-2">{item.quantity}x</span>
                                                    {item.menu_item.name}
                                                </div>
                                                {item.notes && (
                                                    <div className="text-xs text-amber-600 font-medium mt-1 bg-amber-50 p-1 rounded">
                                                        Note: {item.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="pt-2 mt-auto">
                                        {order.status === 'placed' && (
                                            <Button className="w-full" onClick={() => updateStatus(order.id, 'preparing')}>
                                                Start Preparing
                                            </Button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => updateStatus(order.id, 'ready')}>
                                                Mark Ready
                                            </Button>
                                        )}
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
