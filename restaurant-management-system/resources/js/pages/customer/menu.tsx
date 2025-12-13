import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';
import CustomerNavbar from '@/components/customer-navbar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Modifier {
    id: number;
    name: string;
    price_cents: number;
    is_available: boolean;
}

interface ModifierGroup {
    id: number;
    name: string;
    min_selection: number;
    max_selection: number;
    modifiers: Modifier[];
}

interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price_cents: number;
    image_url?: string | null;
    category?: string | null;
    modifier_groups?: ModifierGroup[];
}

interface Category {
    id: number;
    name: string;
}

interface CartLine {
    cartId: string;
    id: number;
    name: string;
    price_cents: number;
    quantity: number;
    modifiers: {
        group_name: string;
        option_name: string;
        price_cents: number;
        modifier_id: number;
    }[];
}

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;
const CART_KEY = 'customer_cart';

export default function CustomerMenuPage() {
    const { auth } = usePage<SharedData>().props;
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartLine[]>(() => {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    });
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    
    // Customization state
    const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories?all=1');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.data || data);
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', currentPage.toString());
                if (categoryFilter) {
                    params.append('category', categoryFilter);
                }
                // Note: Search is currently client-side filtered because the API doesn't support search query yet.
                // Ideally, we should add search support to the backend too.
                
                const res = await fetch(`/api/menu?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to load menu');
                const data = await res.json();
                
                // Handle paginated response
                if (data.data && data.meta) {
                    setItems(data.data);
                    setCurrentPage(data.meta.current_page);
                    setLastPage(data.meta.last_page);
                } else {
                    // Fallback for non-paginated response (though we updated the controller)
                    const list = Array.isArray(data?.data) ? data.data : data;
                    setItems(list as MenuItem[]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [currentPage, categoryFilter]);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }, [cart]);

    // Client-side search filtering (applied to the current page of results)
    const filtered = useMemo(() => {
        if (!search) return items;
        return items.filter((i) => {
            return i.name.toLowerCase().includes(search.toLowerCase()) || (i.description ?? '').toLowerCase().includes(search.toLowerCase());
        });
    }, [items, search]);

    const openCustomization = (item: MenuItem) => {
        if (item.modifier_groups && item.modifier_groups.length > 0) {
            setCustomizingItem(item);
            // Initialize default selections if needed, or empty
            setSelectedModifiers({});
        } else {
            addItemToCart(item, []);
        }
    };

    const addItemToCart = (item: MenuItem, modifiers: CartLine['modifiers']) => {
        setCart((prev) => {
            // Check for identical item (same ID and same modifiers)
            // This is a simple check, might need more robust comparison for complex modifiers
            const existingIndex = prev.findIndex((line) => 
                line.id === item.id && 
                JSON.stringify(line.modifiers) === JSON.stringify(modifiers)
            );

            if (existingIndex >= 0) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }
            
            // Calculate base price + modifiers
            const modifiersTotal = modifiers.reduce((sum, m) => sum + m.price_cents, 0);
            
            return [...prev, { 
                cartId: crypto.randomUUID(),
                id: item.id, 
                name: item.name, 
                price_cents: item.price_cents + modifiersTotal, 
                quantity: 1,
                modifiers 
            }];
        });
        setCustomizingItem(null);
        setSelectedModifiers({});
    };

    const handleModifierToggle = (groupId: number, modifierId: number, isSingle: boolean) => {
        setSelectedModifiers(prev => {
            const current = prev[groupId] || [];
            if (isSingle) {
                // If clicking the same one, do nothing (radio behavior usually requires one selected)
                // Or allow deselect if min_selection is 0? Let's assume radio behavior for now.
                return { ...prev, [groupId]: [modifierId] };
            } else {
                // Checkbox behavior
                if (current.includes(modifierId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== modifierId) };
                } else {
                    return { ...prev, [groupId]: [...current, modifierId] };
                }
            }
        });
    };

    const confirmCustomization = () => {
        if (!customizingItem) return;

        // Validation
        for (const group of customizingItem.modifier_groups || []) {
            const selectedCount = (selectedModifiers[group.id] || []).length;
            if (selectedCount < group.min_selection) {
                alert(`Please select at least ${group.min_selection} option(s) for ${group.name}`);
                return;
            }
            if (selectedCount > group.max_selection) {
                alert(`Please select at most ${group.max_selection} option(s) for ${group.name}`);
                return;
            }
        }

        // Build modifiers list
        const finalModifiers: CartLine['modifiers'] = [];
        customizingItem.modifier_groups?.forEach(group => {
            const selectedIds = selectedModifiers[group.id] || [];
            selectedIds.forEach(modId => {
                const mod = group.modifiers.find(m => m.id === modId);
                if (mod) {
                    finalModifiers.push({
                        group_name: group.name,
                        option_name: mod.name,
                        price_cents: mod.price_cents,
                        modifier_id: mod.id
                    });
                }
            });
        });

        addItemToCart(customizingItem, finalModifiers);
    };

    const cartTotalCents = useMemo(
        () => cart.reduce((sum, line) => sum + line.price_cents * line.quantity, 0),
        [cart]
    );

    const cartCount = useMemo(
        () => cart.reduce((sum, line) => sum + line.quantity, 0),
        [cart]
    );

    const handleCategoryChange = (catName: string) => {
        setCategoryFilter(catName);
        setCurrentPage(1); // Reset to first page when changing category
    };

    return (
        <div className="min-h-screen bg-background">
            <Head title="Menu" />
            
            <CustomerNavbar cartCount={cartCount}>
                {/* Category Tabs */}
                <div className="border-t bg-muted/30 overflow-x-auto">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-2 py-3 min-w-max">
                            <Button 
                                variant={categoryFilter === '' ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleCategoryChange('')}
                                className="rounded-full"
                            >
                                All Items
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={categoryFilter === cat.name ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleCategoryChange(cat.name)}
                                    className="rounded-full"
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </CustomerNavbar>

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-8">
                <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {categoryFilter || 'Our Menu'}
                        </h1>
                        <p className="text-muted-foreground mt-1">Freshly brewed coffee, delicious pastries, and more.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search current page..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 content-start">
                            {loading && <p className="text-sm text-muted-foreground col-span-full text-center py-12">Loading menu...</p>}
                            {!loading && filtered.length === 0 && (
                                <p className="text-sm text-muted-foreground col-span-full text-center py-12">No items found matching your criteria.</p>
                            )}
                            {filtered.map((item) => (
                                <Card key={item.id} className="flex h-full flex-col overflow-hidden hover:shadow-md transition-shadow">
                                    {item.image_url && (
                                        <div className="aspect-video w-full overflow-hidden bg-muted">
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name} 
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                                            <Badge variant="secondary" className="shrink-0">{formatCurrency(item.price_cents)}</Badge>
                                        </div>
                                        {item.category && (
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-xs font-normal">{item.category}</Badge>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-3">
                                        <p className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]">{item.description || 'No description available.'}</p>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button className="w-full" onClick={() => openCustomization(item)}>
                                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Order
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        
                        {/* Pagination Controls */}
                        {!loading && lastPage > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {lastPage}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
                                    disabled={currentPage === lastPage}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-36 shadow-md border-primary/20">
                            <CardHeader className="bg-muted/50 pb-4">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span>Your Order</span>
                                    <Badge variant="default">{cartCount}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {cart.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>Your cart is empty.</p>
                                        <p className="text-xs mt-1">Add items to get started!</p>
                                    </div>
                                )}
                                {cart.map((line, idx) => (
                                    <div key={line.cartId || `${line.id}-${idx}`} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{line.name}</p>
                                            {line.modifiers && line.modifiers.length > 0 && (
                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                    {line.modifiers.map((mod, i) => (
                                                        <div key={i}>+ {mod.option_name}</div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">Qty: {line.quantity}</p>
                                        </div>
                                        <div className="text-right font-medium">
                                            {formatCurrency(line.price_cents * line.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            {cart.length > 0 && (
                                <CardFooter className="flex flex-col gap-4 bg-muted/50 pt-6">
                                    <div className="flex w-full items-center justify-between text-base font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(cartTotalCents)}</span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={() => {
                                            router.visit('/shop/checkout');
                                        }}
                                    >
                                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-muted-foreground hover:text-destructive"
                                        onClick={() => setCart([])}
                                    >
                                        Clear Order
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={!!customizingItem} onOpenChange={(open) => !open && setCustomizingItem(null)}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Customize {customizingItem?.name}</DialogTitle>
                        <DialogDescription>
                            Select your preferences
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {customizingItem?.modifier_groups?.map(group => (
                            <div key={group.id} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">{group.name}</h4>
                                    <span className="text-xs text-muted-foreground">
                                        {group.min_selection > 0 ? `Required (Min ${group.min_selection})` : 'Optional'}
                                        {group.max_selection > 1 && ` • Max ${group.max_selection}`}
                                    </span>
                                </div>
                                <div className="grid gap-2">
                                    {group.modifiers.map(mod => {
                                        const isSelected = (selectedModifiers[group.id] || []).includes(mod.id);
                                        const isSingle = group.max_selection === 1;
                                        
                                        return (
                                            <div 
                                                key={mod.id} 
                                                className={`
                                                    flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                                                    ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                                                    ${!mod.is_available ? 'opacity-50 pointer-events-none' : ''}
                                                `}
                                                onClick={() => handleModifierToggle(group.id, mod.id, isSingle)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                                                        h-4 w-4 rounded-full border flex items-center justify-center
                                                        ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                                                    `}>
                                                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{mod.name}</span>
                                                </div>
                                                {mod.price_cents > 0 && (
                                                    <span className="text-sm text-muted-foreground">+{formatCurrency(mod.price_cents)}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setCustomizingItem(null)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmCustomization}>
                            Add to Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to add items to your cart and place an order.
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
        </div>
    );
}
