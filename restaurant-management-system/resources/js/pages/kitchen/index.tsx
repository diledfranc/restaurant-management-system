import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, RefreshCw, ChefHat, ArrowRight, AlertTriangle, Utensils } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    table_number?: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function KitchenIndex() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kitchen/orders');
            if (res.ok) {
                const data = await res.json();
                // Ensure sorting: Oldest first (FIFO)
                const sorted = data.data.sort((a: Order, b: Order) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                setOrders(sorted);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
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
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                if (status === 'ready') {
                    // Remove from list immediately
                    setOrders(prev => prev.filter(o => o.id !== orderId));
                } else {
                    // Update status locally
                    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
                }
            }
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleCompleteClick = (order: Order) => {
        setConfirmingOrder(order);
    };

    const confirmComplete = () => {
        if (confirmingOrder) {
            updateStatus(confirmingOrder.id, 'ready');
            setConfirmingOrder(null);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kitchen Display', href: '/kitchen' }]}>
            <Head title="Kitchen Display" />

            <div className="p-4 md:p-6 h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50/50">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ChefHat className="h-8 w-8 text-orange-600" />
                        Kitchen Display System
                    </h1>
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {orders.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <CheckCircle className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-xl font-medium">All caught up!</p>
                        <p>No active orders at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => (
                            <OrderSlip 
                                key={order.id} 
                                order={order} 
                                onUpdateStatus={updateStatus}
                                onComplete={() => handleCompleteClick(order)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!confirmingOrder} onOpenChange={(open) => !open && setConfirmingOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Order #{confirmingOrder?.id}?</DialogTitle>
                        <DialogDescription>
                            Are you sure this order is fully prepared and ready to be served?
                            This will remove it from the kitchen display.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmingOrder(null)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={confirmComplete}>
                            Confirm Completed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function OrderSlip({ order, onUpdateStatus, onComplete }: { 
    order: Order, 
    onUpdateStatus: (id: number, status: string) => void,
    onComplete: () => void
}) {
    const isNew = order.status === 'placed';
    const isPreparing = order.status === 'preparing';
    
    // HH:MM format
    const timeString = format(new Date(order.created_at), 'HH:mm');

    return (
        <Card className={`flex flex-col h-full shadow-md border-t-4 ${isNew ? 'border-t-red-500 bg-red-50/30' : 'border-t-yellow-500 bg-yellow-50/30'}`}>
            <CardHeader className="pb-2 bg-white/50">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant={isNew ? "destructive" : "default"} className={isPreparing ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}>
                                {isNew ? <AlertTriangle className="h-3 w-3 mr-1" /> : <Utensils className="h-3 w-3 mr-1" />}
                                {isNew ? 'NEW ORDER' : 'PREPARING'}
                            </Badge>
                            <span className="text-xs font-mono text-gray-500">{timeString}</span>
                        </div>
                        <CardTitle className="text-xl mt-2">
                            #{order.id} 
                            {order.table_number && <span className="ml-2 text-lg font-normal text-gray-600">Table {order.table_number}</span>}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {order.guest_name || 'Guest'}
                        </p>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 py-3 bg-white/80">
                <div className="space-y-3">
                    {order.items.map(item => (
                        <div key={item.id} className="border-b border-dashed border-gray-200 last:border-0 pb-2 last:pb-0">
                            <div className="flex gap-3">
                                <span className="font-bold text-lg w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
                                    {item.quantity}
                                </span>
                                <div className="flex-1">
                                    <p className="font-bold text-base leading-tight">{item.menu_item.name}</p>
                                    
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {item.modifiers.map(m => (
                                                <span key={m.id} className="block">• {m.name}</span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {item.notes && (
                                        <div className="mt-1 text-sm text-red-600 bg-red-50 p-1.5 rounded border border-red-100 italic">
                                            "{item.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="pt-3 pb-4 bg-white border-t">
                {isNew ? (
                    <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold" 
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                    >
                        <ChefHat className="mr-2 h-4 w-4" />
                        Start Cooking
                    </Button>
                ) : (
                    <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold" 
                        onClick={onComplete}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Order Ready
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
