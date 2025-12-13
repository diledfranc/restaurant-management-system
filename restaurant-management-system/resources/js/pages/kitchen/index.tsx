import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, RefreshCw, ChefHat, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatDistanceToNow } from 'date-fns';

interface Modifier {
    id: number;
    name: string;
    price_cents: number;
}

interface OrderItem {
    id: number;
    menu_item: {
        name: string;
    };
    quantity: number;
    notes?: string;
    modifiers?: Modifier[];
}

interface Order {
    id: number;
    guest_name?: string;
    status: string;
    created_at: string;
    items: OrderItem[];
    table_number?: string; // Assuming we might have this later
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

    const updateStatus = async (orderId: number, status: string) => {
        try {
            const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({ status })
            });
            
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const placedOrders = orders.filter(o => o.status === 'placed');
    const preparingOrders = orders.filter(o => o.status === 'preparing');

    return (
        <AppLayout>
            <Head title="Kitchen Display System" />
            
            <div className="p-6 h-[calc(100vh-65px)] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <ChefHat className="h-8 w-8 text-orange-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Kitchen Display System</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* New Orders Column */}
                    <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 h-full">
                        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg flex justify-between items-center">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                New Orders
                            </h2>
                            <Badge variant="secondary">{placedOrders.length}</Badge>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {placedOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No new orders
                                </div>
                            ) : (
                                placedOrders.map(order => (
                                    <OrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onAction={() => updateStatus(order.id, 'preparing')}
                                        actionLabel="Start Preparing"
                                        actionColor="default"
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="flex flex-col bg-gray-50 rounded-lg border border-gray-200 h-full">
                        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg flex justify-between items-center">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                Preparing
                            </h2>
                            <Badge variant="secondary">{preparingOrders.length}</Badge>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {preparingOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No orders in preparation
                                </div>
                            ) : (
                                preparingOrders.map(order => (
                                    <OrderCard 
                                        key={order.id} 
                                        order={order} 
                                        onAction={() => updateStatus(order.id, 'ready')}
                                        actionLabel="Mark Ready"
                                        actionColor="success"
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function OrderCard({ order, onAction, actionLabel, actionColor }: { 
    order: Order, 
    onAction: () => void, 
    actionLabel: string,
    actionColor: 'default' | 'success' 
}) {
    const elapsed = formatDistanceToNow(new Date(order.created_at));
    const isLongWait = (new Date().getTime() - new Date(order.created_at).getTime()) > 1000 * 60 * 15; // 15 mins

    return (
        <Card className={`border-l-4 ${isLongWait ? 'border-l-red-500' : 'border-l-blue-500'} shadow-sm`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            {order.guest_name || 'Guest'}
                        </p>
                    </div>
                    <Badge variant={isLongWait ? "destructive" : "outline"} className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {elapsed}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                            <div className="flex gap-2">
                                <span className="font-bold w-6 text-center bg-gray-100 rounded">{item.quantity}</span>
                                <div>
                                    <span className="font-medium">{item.menu_item.name}</span>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            + {item.modifiers.map(m => m.name).join(', ')}
                                        </div>
                                    )}
                                    {item.notes && (
                                        <div className="text-xs text-orange-600 italic mt-0.5 bg-orange-50 p-1 rounded">
                                            Note: {item.notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button 
                    className={`w-full ${actionColor === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`} 
                    onClick={onAction}
                >
                    {actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
