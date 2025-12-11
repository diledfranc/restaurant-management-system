import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { type SharedData } from '@/types';
import CustomerLayout from '@/layouts/customer-layout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CartLine {
    id: number;
    name: string;
    price_cents: number;
    quantity: number;
}

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;
const CART_KEY = 'customer_cart';

export default function CartPage() {
    const { auth } = usePage<SharedData>().props;
    const [cart, setCart] = useState<CartLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
            try {
                setCart(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            // Dispatch a custom event so the navbar can update the count immediately if it listens to it
            // However, the navbar currently reads from localStorage on mount. 
            // To make it reactive across components without a global store context is tricky with just localStorage.
            // But since we are navigating to a new page, the layout will remount or re-render.
            // Actually, Inertia navigation might not remount the layout if it's persistent, but here we are using a simple layout.
            // Let's dispatch an event anyway, just in case we add a listener later.
            window.dispatchEvent(new Event('cart-updated'));
        }
    }, [cart, loading]);

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            setCart([]);
        }
    };

    const cartTotalCents = useMemo(
        () => cart.reduce((sum, line) => sum + line.price_cents * line.quantity, 0),
        [cart]
    );

    const handleCheckout = () => {
        if (!auth.user) {
            setShowLoginDialog(true);
        } else {
            router.visit('/shop/checkout');
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="container mx-auto p-8 text-center">
                    <p className="text-muted-foreground">Loading cart...</p>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <Head title="Your Cart" />
            
            <div className="container mx-auto max-w-4xl p-4 sm:p-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8" />
                    Your Cart
                </h1>

                {cart.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
                            <Link href="/shop">
                                <Button size="lg">
                                    Browse Menu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items ({cart.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y">
                                    {cart.map((item) => (
                                        <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg">{item.name}</h3>
                                                <p className="text-muted-foreground">{formatCurrency(item.price_cents)} each</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border rounded-md">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, -1) : removeItem(item.id)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="text-right font-bold min-w-[80px]">
                                                {formatCurrency(item.price_cents * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="sticky top-24">
                                <CardHeader className="bg-muted/50">
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(cartTotalCents)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax (estimated)</span>
                                        <span>{formatCurrency(cartTotalCents * 0.07)}</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(cartTotalCents * 1.07)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 bg-muted/50 pt-6">
                                    <Button className="w-full" size="lg" onClick={handleCheckout}>
                                        Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={clearCart}>
                                        Clear Cart
                                    </Button>
                                    <Link href="/shop" className="w-full">
                                        <Button variant="ghost" className="w-full">
                                            Continue Shopping
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to place an order.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                            Cancel
                        </Button>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button className="w-full">Log in</Button>
                        </Link>
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button variant="secondary" className="w-full">Create Account</Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CustomerLayout>
    );
}
