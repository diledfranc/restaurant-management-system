import { Head } from '@inertiajs/react';
import CustomerLayout from '@/layouts/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface Order {
    id: number;
    status: string;
    total_cents: number;
    guest_name?: string;
    guest_phone?: string;
    guest_address?: string;
    created_at: string;
    items?: Array<{
        id: number;
        name: string;
        quantity: number;
        price_cents: number;
    }>;
}

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'preparing':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'ready':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'delivered':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        case 'cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

export default function CustomerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/customer/orders');
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
        <CustomerLayout>
            <Head title="My Orders" />
            <div className="container mx-auto p-4 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">My Orders</h1>
                        <p className="text-sm text-muted-foreground">
                            View your order history and track current orders
                        </p>
                    </div>
                </div>

                <div className="space-y-4 max-w-3xl mx-auto">
                    {loading && <p className="text-sm text-muted-foreground">Loading orders...</p>}
                    
                    {!loading && orders.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">No orders yet</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Start ordering from our menu!
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <Badge className={getStatusColor(order.status)}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.items && order.items.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Items:</p>
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                    <span>{formatCurrency(item.price_cents * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-3 font-semibold">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_cents)}</span>
                                    </div>
                                    {order.guest_address && (
                                        <div className="border-t pt-3 text-sm text-muted-foreground">
                                            <p className="font-medium">Delivery Address:</p>
                                            <p>{order.guest_address}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </CustomerLayout>
    );
}
