import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, UtensilsCrossed, ShoppingCart, FileText, Truck, Users, Calendar, Home, User, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const customerNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/',
        icon: Home,
    },
    {
        title: 'Menu',
        href: '/shop',
        icon: UtensilsCrossed,
    },
    {
        title: 'My Orders',
        href: '/customer/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { roles } = page.props.auth;
    
    const getMainNavItems = () => {
        if (!roles || roles.length === 0) return customerNavItems;

        if (roles.includes('admin')) {
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Staff', href: '/staff', icon: Users },
                { title: 'Activity Logs', href: '/logs', icon: FileText },
                { title: 'Settings', href: '/settings', icon: Settings },
            ];
        }

        if (roles.includes('manager')) {
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Menu', href: '/menu', icon: UtensilsCrossed },
                { title: 'Orders', href: '/orders', icon: ShoppingCart },
                { title: 'Reports', href: '/reports', icon: FileText },
                { title: 'Delivery', href: '/delivery', icon: Truck },
                { title: 'Reservations', href: '/reservations', icon: Calendar },
            ];
        }

        if (roles.includes('staff')) {
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Orders', href: '/orders', icon: ShoppingCart },
                { title: 'Delivery', href: '/delivery', icon: Truck },
            ];
        }

        // Default to customer items for any other role (e.g. customer)
        return customerNavItems;
    };
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={getMainNavItems()} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
