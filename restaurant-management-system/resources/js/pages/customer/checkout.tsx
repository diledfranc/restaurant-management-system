import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

interface CartLine {
    id: number;
    name: string;
    price_cents: number;
    quantity: number;
}

const CART_KEY = 'customer_cart';
const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function CustomerCheckoutPage() {
    const [cart, setCart] = useState<CartLine[]>([]);
    const [form, setForm] = useState({
        guest_name: '',
        guest_phone: '',
        guest_address: '',
        payment_method: 'cash',
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(CART_KEY);
        setCart(stored ? JSON.parse(stored) : []);
    }, []);

    const totalCents = useMemo(
        () => cart.reduce((sum, line) => sum + line.price_cents * line.quantity, 0),
        [cart]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setSubmitting(true);
        setErrors({});
        setSuccess(null);

        const payload = {
            guest_name: form.guest_name,
            guest_phone: form.guest_phone,
            guest_address: form.guest_address,
            payment_method: form.payment_method,
            cart: cart.map((line) => ({
                menu_item_id: line.id,
                quantity: line.quantity,
            })),
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': document.querySelector('[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 201) {
                setSuccess('Order placed! You will receive updates soon.');
                setCart([]);
                localStorage.removeItem(CART_KEY);
            } else if (res.status === 422) {
                const data = await res.json();
                setErrors(data.errors || {});
            } else {
                setErrors({ general: ['Failed to place order. Please try again.'] });
            }
        } catch (err) {
            setErrors({ general: ['Failed to place order. Please try again.'] });
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [field]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Checkout" />
            <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
                <Link href="/shop" className="text-lg font-semibold">
                    TasteHub
                </Link>
                <div className="flex items-center gap-2 text-sm">
                    <AppearanceToggleDropdown />
                    <Link href="/login" className="text-muted-foreground hover:text-foreground">
                        Log in
                    </Link>
                    <Link href="/register" className="rounded-md border px-3 py-1 font-medium hover:bg-accent">
                        Sign up
                    </Link>
                </div>
            </header>

            <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Checkout</h1>
                    <Link href="/shop" className="text-sm text-primary hover:underline">
                        Back to menu
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                    <Card>
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">Your details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="guest_name">Name</Label>
                                    <Input id="guest_name" value={form.guest_name} onChange={updateField('guest_name')} required />
                                    {errors.guest_name && (
                                        <p className="text-xs text-destructive">{errors.guest_name[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="guest_phone">Phone</Label>
                                    <Input id="guest_phone" value={form.guest_phone} onChange={updateField('guest_phone')} required />
                                    {errors.guest_phone && (
                                        <p className="text-xs text-destructive">{errors.guest_phone[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="guest_address">Address</Label>
                                    <textarea
                                        id="guest_address"
                                        value={form.guest_address}
                                        onChange={updateField('guest_address')}
                                        rows={3}
                                        required
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.guest_address && (
                                        <p className="text-xs text-destructive">{errors.guest_address[0]}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="payment_method">Payment method</Label>
                                    <select
                                        id="payment_method"
                                        className="w-full rounded-md border p-2 text-sm"
                                        value={form.payment_method}
                                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                    >
                                        <option value="cash">Cash on delivery</option>
                                        <option value="card">Card on delivery</option>
                                    </select>
                                </div>
                                {errors.general && (
                                    <p className="text-sm text-destructive">{errors.general[0]}</p>
                                )}
                                {success && <p className="text-sm text-green-600">{success}</p>}
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button type="submit" disabled={cart.length === 0 || submitting} className="w-full">
                                    {submitting ? 'Placing order...' : 'Place order'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Order summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {cart.length === 0 && <p className="text-muted-foreground">Your cart is empty.</p>}
                            {cart.map((line) => (
                                <div key={line.id} className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{line.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty {line.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold">{formatCurrency(line.price_cents * line.quantity)}</p>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex items-center justify-between font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(totalCents)}</span>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
