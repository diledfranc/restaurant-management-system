import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ModifierDialog from './modifier-dialog';

interface Modifier {
    id: number;
    name: string;
    price_cents: number;
    is_available: boolean;
}

interface ModifierGroup {
    id: number;
    name: string;
    is_required: boolean;
    is_multiple: boolean;
    modifiers: Modifier[];
}

interface MenuItem {
    id: number;
    name: string;
    price_cents: number;
    is_available: boolean;
    image?: string;
    modifier_groups?: ModifierGroup[];
}

interface Category {
    id: number;
    name: string;
    items: MenuItem[];
}

interface CartItem {
    uniqueId: string;
    id: number; // menu item id
    name: string;
    price_cents: number;
    quantity: number;
    notes: string;
    modifiers: { modifier_id: number, price_cents: number, name: string }[];
}

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;

export default function PosIndex({ categories }: { categories: Category[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [guestName, setGuestName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<MenuItem | null>(null);

    const filteredItems = useMemo(() => {
        let items: (MenuItem & { categoryName: string })[] = [];
        categories.forEach(cat => {
            if (selectedCategory === 'all' || cat.id.toString() === selectedCategory) {
                cat.items.forEach(item => {
                    if (item.name.toLowerCase().includes(search.toLowerCase())) {
                        items.push({ ...item, categoryName: cat.name });
                    }
                });
            }
        });
        return items;
    }, [categories, search, selectedCategory]);

    const handleItemClick = (item: MenuItem) => {
        if (item.modifier_groups && item.modifier_groups.length > 0) {
            setSelectedItemForModifiers(item);
        } else {
            addToCart(item, []);
        }
    };

    const addToCart = (item: MenuItem, modifiers: { modifier_id: number, price_cents: number, name: string }[]) => {
        setCart(prev => {
            // If no modifiers, try to merge with existing identical item
            if (modifiers.length === 0) {
                const existing = prev.find(i => i.id === item.id && i.modifiers.length === 0 && i.notes === '');
                if (existing) {
                    return prev.map(i => i.uniqueId === existing.uniqueId ? { ...i, quantity: i.quantity + 1 } : i);
                }
            }
            
            // Otherwise add new item
            return [...prev, { 
                uniqueId: Date.now().toString() + Math.random().toString(),
                id: item.id, 
                name: item.name, 
                price_cents: item.price_cents, 
                quantity: 1, 
                notes: '',
                modifiers: modifiers
            }];
        });
        setSelectedItemForModifiers(null);
    };

    const updateQuantity = (uniqueId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.uniqueId === uniqueId) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(prev => prev.filter(i => i.uniqueId !== uniqueId));
    };

    const updateNotes = (uniqueId: string, notes: string) => {
        setCart(prev => prev.map(i => i.uniqueId === uniqueId ? { ...i, notes } : i));
    };

    const totalCents = cart.reduce((sum, item) => {
        const modifiersCost = item.modifiers.reduce((mSum, m) => mSum + m.price_cents, 0);
        return sum + ((item.price_cents + modifiersCost) * item.quantity);
    }, 0);

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/pos/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                },
                body: JSON.stringify({
                    items: cart.map(i => ({ 
                        id: i.id, 
                        quantity: i.quantity, 
                        notes: i.notes,
                        modifiers: i.modifiers 
                    })),
                    payment_method: paymentMethod,
                    guest_name: guestName,
                }),
            });

            if (response.ok) {
                setCart([]);
                setGuestName('');
                setPaymentMethod('cash');
                alert('Order placed successfully!');
            } else {
                const data = await response.json();
                alert('Failed to place order: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'POS', href: '/pos' }]}>
            <Head title="POS" />
            <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row overflow-hidden">
                {/* Left: Menu */}
                <div className="flex-1 flex flex-col border-r bg-muted/10">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredItems.map(item => (
                                <Card 
                                    key={item.id} 
                                    className="cursor-pointer hover:bg-accent transition-colors overflow-hidden"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="aspect-square w-full bg-muted relative">
                                        {item.image ? (
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                                <span className="text-xs">No Image</span>
                                            </div>
                                        )}
                                        {item.modifier_groups && item.modifier_groups.length > 0 && (
                                            <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
                                                Customizable
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-3 flex flex-col justify-between gap-2">
                                        <div className="font-medium text-sm line-clamp-2 leading-tight">{item.name}</div>
                                        <div className="text-sm font-bold text-primary">
                                            {formatCurrency(item.price_cents)}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right: Cart */}
                <div className="w-full md:w-[400px] flex flex-col bg-background">
                    <div className="p-4 border-b bg-muted/30">
                        <h2 className="font-semibold flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Current Order
                        </h2>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                <ShoppingCart className="h-12 w-12 opacity-20" />
                                <p>Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.uniqueId} className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                                        <div className="flex justify-between items-start">
                                            <div className="font-medium">
                                                {item.name}
                                                {item.modifiers.length > 0 && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        + {item.modifiers.map(m => m.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-bold">
                                                {formatCurrency((item.price_cents + item.modifiers.reduce((s, m) => s + m.price_cents, 0)) * item.quantity)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.uniqueId, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.uniqueId, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.uniqueId)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input 
                                            placeholder="Notes (optional)" 
                                            className="h-7 text-xs" 
                                            value={item.notes}
                                            onChange={(e) => updateNotes(item.uniqueId, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-4 border-t bg-muted/10 space-y-4">
                        <div className="space-y-2">
                            <Label>Guest Name (Optional)</Label>
                            <Input 
                                value={guestName} 
                                onChange={(e) => setGuestName(e.target.value)} 
                                placeholder="Walk-in / Table #"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="cash">
                                        <Banknote className="mr-2 h-4 w-4" />
                                        Cash
                                    </TabsTrigger>
                                    <TabsTrigger value="card">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Card
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>{formatCurrency(totalCents)}</span>
                        </div>

                        <Button 
                            className="w-full" 
                            size="lg" 
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Processing...' : `Charge ${formatCurrency(totalCents)}`}
                        </Button>
                    </div>
                </div>
            </div>

            <ModifierDialog 
                item={selectedItemForModifiers} 
                isOpen={!!selectedItemForModifiers} 
                onClose={() => setSelectedItemForModifiers(null)} 
                onConfirm={(modifiers) => addToCart(selectedItemForModifiers!, modifiers)} 
            />
        </AppLayout>
    );
}
