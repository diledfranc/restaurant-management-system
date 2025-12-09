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
import { BookOpen, Folder, LayoutGrid, UtensilsCrossed, ShoppingCart, FileText, Truck, Users, Calendar, Home, User } from 'lucide-react';
import AppLogo from './app-logo';

const managementNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Menu',
        href: '/menu',
        icon: UtensilsCrossed,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
    },
    {
        title: 'Delivery',
        href: '/delivery',
        icon: Truck,
    },
    {
        title: 'Staff',
        href: '/staff',
        icon: Users,
    },
    {
        title: 'Reservations',
        href: '/reservations',
        icon: Calendar,
    },
];

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
    
    // Determine if user has management access (admin, manager, or staff)
    const hasManagementAccess = roles?.some((role: string) => 
        ['admin', 'manager', 'staff'].includes(role)
    );
    
    // Filter management items based on role
    const getMainNavItems = () => {
        if (!hasManagementAccess) {
            return customerNavItems;
        }
        
        // For management users, filter out staff page unless admin
        if (!roles?.includes('admin')) {
            return managementNavItems.filter(item => item.title !== 'Staff');
        }
        
        return managementNavItems;
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
