import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price_cents: number;
    image_url?: string | null;
    category?: string | null;
}

interface CartLine {
    id: number;
    name: string;
    price_cents: number;
    quantity: number;
}

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const CART_KEY = 'customer_cart';

export default function CustomerMenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartLine[]>(() => {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    });
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch('/api/menu');
                if (!res.ok) throw new Error('Failed to load menu');
                const data = await res.json();
                // MenuItemResource returns `data` array under data for pagination
                const list = Array.isArray(data?.data) ? data.data : data;
                setItems(list as MenuItem[]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        items.forEach((i) => i.category && set.add(i.category));
        return Array.from(set.values());
    }, [items]);

    const filtered = useMemo(() => {
        return items.filter((i) => {
            const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.description ?? '').toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter ? i.category === categoryFilter : true;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, categoryFilter]);

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const existing = prev.find((line) => line.id === item.id);
            if (existing) {
                return prev.map((line) =>
                    line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
                );
            }
            return [...prev, { id: item.id, name: item.name, price_cents: item.price_cents, quantity: 1 }];
        });
    };

    const cartTotalCents = useMemo(
        () => cart.reduce((sum, line) => sum + line.price_cents * line.quantity, 0),
        [cart]
    );

    const cartCount = useMemo(
        () => cart.reduce((sum, line) => sum + line.quantity, 0),
        [cart]
    );

    return (
        <div className="min-h-screen bg-background">
            <Head title="Shop" />
            <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
                <Link href="/" className="text-lg font-semibold">
                    TasteHub
                </Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link href="/login" className="text-muted-foreground hover:text-foreground">
                        Log in
                    </Link>
                    <Link href="/register" className="rounded-md border px-3 py-1 font-medium hover:bg-accent">
                        Sign up
                    </Link>
                </div>
            </header>
            <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:p-6">
                <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Order delicious meals</h1>
                        <p className="text-sm text-muted-foreground">Browse the menu and add items to your cart.</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search menu..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-56"
                        />
                        <select
                            className="w-full rounded-md border p-2 text-sm sm:w-40"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {loading && <p className="text-sm text-muted-foreground">Loading menu...</p>}
                        {!loading && filtered.length === 0 && (
                            <p className="text-sm text-muted-foreground">No items found.</p>
                        )}
                        {filtered.map((item) => (
                            <Card key={item.id} className="flex h-full flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description || 'No description'}</p>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{formatCurrency(item.price_cents)}</Badge>
                                        {item.category && (
                                            <Badge variant="secondary">{item.category}</Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="mt-auto">
                                    <Button className="w-full" onClick={() => addToCart(item)}>
                                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to cart
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <Card className="sticky top-4 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-lg">
                                <span>Cart</span>
                                <Badge variant="secondary">{cartCount} items</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {cart.length === 0 && (
                                <p className="text-muted-foreground">Your cart is empty.</p>
                            )}
                            {cart.map((line) => (
                                <div key={line.id} className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{line.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty {line.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{formatCurrency(line.price_cents * line.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <div className="flex w-full items-center justify-between text-sm font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(cartTotalCents)}</span>
                            </div>
                            <Button
                                className="w-full"
                                disabled={cart.length === 0}
                                onClick={() => {
                                    router.visit('/shop/checkout');
                                }}
                            >
                                Go to checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={cart.length === 0}
                                onClick={() => setCart([])}
                            >
                                Clear cart
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
