import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, User, ShoppingBag, LogOut, Menu, Globe, Bell } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, type ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';

interface CustomerNavbarProps {
    children?: ReactNode;
    cartCount?: number;
    onCartClick?: () => void;
}

export default function CustomerNavbar({ children, cartCount = 0, onCartClick }: CustomerNavbarProps) {
    const { auth } = usePage<SharedData>().props;
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [language, setLanguage] = useState<'en' | 'th'>('en');
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const res = await fetch('/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAuthAction = (e: React.MouseEvent, href: string) => {
        if (!auth.user) {
            e.preventDefault();
            setShowLoginDialog(true);
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'th' : 'en');
    };

    return (
        <>
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Sidebar & Logo */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="bg-primary text-primary-foreground p-1 rounded-md">
                                            <AppLogoIcon className="h-5 w-5 fill-current" />
                                        </div>
                                        MOMO
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="grid gap-4 py-6">
                                    <Link href="/shop" className="text-lg font-medium hover:text-primary px-2 py-1 rounded-md hover:bg-muted">
                                        Menu
                                    </Link>
                                    <Link 
                                        href="/customer/orders" 
                                        onClick={(e) => handleAuthAction(e, '/customer/orders')}
                                        className="text-lg font-medium hover:text-primary px-2 py-1 rounded-md hover:bg-muted"
                                    >
                                        My Orders
                                    </Link>
                                    {/* Add more sidebar links here */}
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-md hidden sm:block">
                                <AppLogoIcon className="h-6 w-6 fill-current" />
                            </div>
                            <span>MOMO</span>
                        </Link>
                    </div>

                    {/* Right: Cart, Language, Profile */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Cart */}
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="/cart">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                                        {cartCount}
                                    </Badge>
                                )}
                                <span className="sr-only">Cart</span>
                            </Link>
                        </Button>

                        {/* Language Toggle */}
                        <Button variant="ghost" size="sm" onClick={toggleLanguage} className="font-medium px-2 min-w-[3rem]">
                            <Globe className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">{language.toUpperCase()}</span>
                            <span className="sm:hidden">{language.toUpperCase()}</span>
                        </Button>

                        {/* Notifications */}
                        {auth.user && (
                            <DropdownMenu onOpenChange={(open) => {
                                if (open) fetchNotifications();
                            }}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        {auth.unreadNotificationsCount > 0 && (
                                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="max-h-96 overflow-y-auto">
                                        {loadingNotifications ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer" onClick={() => markAsRead(notification.id)}>
                                                    <div className="flex justify-between w-full">
                                                        <span className={`font-medium ${!notification.read_at ? 'text-primary' : ''}`}>
                                                            {notification.data.message}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <AppearanceToggleDropdown />
                        
                        {/* Profile */}
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">User menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/customer/orders">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            <span>My Orders</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post" as="button" className="w-full cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <User className="h-5 w-5" />
                                        <span className="sr-only">Guest menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowLoginDialog(true)}>
                                        Log in
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/register">Sign up</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
                {children}
            </header>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            Please log in to view your orders and manage your profile.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                            Cancel
                        </Button>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button className="w-full">Log in</Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
