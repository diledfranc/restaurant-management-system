import { Head, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle, Truck, Package, RefreshCw, MapPin } from 'lucide-react';

interface OrderItem {
    id: number;
    menu_item: {
        id: number;
        name: string;
        price_cents: number;
    };
    quantity: number;
    unit_price_cents: number;
    total_price_cents: number;
}

interface Order {
    id: number;
    status: string;
    total_cents: number;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    created_at: string;
    items: OrderItem[];
}

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;

const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return { color: 'bg-yellow-500', icon: Clock, label: 'Pending' };
        case 'preparing':
            return { color: 'bg-blue-500', icon: Package, label: 'Preparing' };
        case 'ready':
            return { color: 'bg-green-500', icon: CheckCircle, label: 'Ready' };
        case 'picked_up':
            return { color: 'bg-purple-500', icon: Truck, label: 'On the Way' };
        case 'delivered':
            return { color: 'bg-gray-500', icon: CheckCircle, label: 'Delivered' };
        case 'cancelled':
            return { color: 'bg-red-500', icon: XCircle, label: 'Cancelled' };
        default:
            return { color: 'bg-gray-500', icon: Clock, label: status };
    }
};

const CART_KEY = 'customer_cart';

export default function CustomerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setIsRefreshing(true);
        
        try {
            const response = await fetch('/api/customer/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(Array.isArray(data?.data) ? data.data : data);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll for updates every 30 seconds
        const interval = setInterval(() => fetchOrders(false), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleReorder = (order: Order) => {
        const currentCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        
        const newItems = order.items.map(item => ({
            id: item.menu_item.id,
            name: item.menu_item.name,
            price_cents: item.menu_item.price_cents,
            quantity: item.quantity
        }));

        const updatedCart = [...currentCart];
        
        newItems.forEach(newItem => {
            const existing = updatedCart.find((c: any) => c.id === newItem.id);
            if (existing) {
                existing.quantity += newItem.quantity;
            } else {
                updatedCart.push(newItem);
            }
        });

        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
        router.visit('/cart');
    };

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready', 'assigned', 'picked_up'].includes(o.status));
    const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

    return (
        <CustomerLayout>
            <Head title="My Orders" />
            <div className="container mx-auto p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Orders</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Track your active orders and view history
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchOrders(false)} disabled={isRefreshing} className="w-full sm:w-auto">
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Tabs defaultValue="active" className="space-y-6">
                        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
                            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="space-y-4">
                            {activeOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 border rounded-xl bg-muted/10 text-muted-foreground p-4 text-center">
                                    <Package className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No active orders at the moment.</p>
                                    <Button variant="link" onClick={() => router.visit('/shop')}>
                                        Browse Menu
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {activeOrders.map((order) => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                            {pastOrders.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">No order history found.</div>
                            ) : (
                                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {pastOrders.map((order) => (
                                        <OrderCard key={order.id} order={order} onReorder={() => handleReorder(order)} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </CustomerLayout>
    );
}

function OrderCard({ order, onReorder }: { order: Order; onReorder?: () => void }) {
    const status = getStatusConfig(order.status);
    const StatusIcon = status.icon;

    return (
        <Card className="flex flex-col overflow-hidden border-l-4" style={{ borderLeftColor: 'var(--border-l-color)' }}>
            <div className={`h-1 w-full ${status.color}`} />
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="space-y-1">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>
                                <span className="font-medium">{item.quantity}x</span> {item.menu_item.name}
                            </span>
                            <span className="text-muted-foreground">
                                {formatCurrency(item.total_price_cents)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(order.total_cents)}</span>
                </div>

                {order.guest_address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{order.guest_address}</span>
                    </div>
                )}
            </CardContent>
            {onReorder && (
                <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full" onClick={onReorder}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Reorder
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
