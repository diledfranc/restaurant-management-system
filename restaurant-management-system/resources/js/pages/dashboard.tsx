import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import * as staff from '@/routes/staff';
import * as logs from '@/routes/logs';
import * as settings from '@/routes/settings';
import * as menu from '@/routes/menu';
import * as orders from '@/routes/orders';
import * as reports from '@/routes/reports';
import * as delivery from '@/routes/delivery';
import * as reservations from '@/routes/reservations';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Settings, Utensils, ShoppingBag, Truck, BarChart3, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const roles = (auth.roles as string[]) || [];

    const isAdmin = roles.includes('admin');
    const isManager = roles.includes('manager');
    const isStaff = roles.includes('staff');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                    Welcome back, {auth.user.name}!
                </h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Admin Dashboard */}
                    {isAdmin && (
                        <>
                            <Link href={staff.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">User Management</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Staff & Users</div>
                                        <p className="text-xs text-muted-foreground">Manage accounts and roles</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={logs.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Activity Logs</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Audit Trail</div>
                                        <p className="text-xs text-muted-foreground">View system activity</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={settings.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Configuration</div>
                                        <p className="text-xs text-muted-foreground">Manage global settings</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}

                    {/* Manager Dashboard */}
                    {isManager && (
                        <>
                            <Link href={menu.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Menu Management</CardTitle>
                                        <Utensils className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Menu Items</div>
                                        <p className="text-xs text-muted-foreground">Add, edit, or remove items</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={orders.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Manage Orders</div>
                                        <p className="text-xs text-muted-foreground">View and process orders</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={reports.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Reports</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Sales & Analytics</div>
                                        <p className="text-xs text-muted-foreground">View performance metrics</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={delivery.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Delivery</CardTitle>
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Delivery Management</div>
                                        <p className="text-xs text-muted-foreground">Assign drivers and track</p>
                                    </CardContent>
                                </Card>
                            </Link>
                            
                             <Link href={reservations.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Reservations</CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Bookings</div>
                                        <p className="text-xs text-muted-foreground">Manage table reservations</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}

                    {/* Staff Dashboard (Subset of Manager) */}
                    {isStaff && !isManager && (
                        <>
                            <Link href={orders.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Active Orders</div>
                                        <p className="text-xs text-muted-foreground">Process incoming orders</p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={delivery.index().url}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Delivery</CardTitle>
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Deliveries</div>
                                        <p className="text-xs text-muted-foreground">View delivery tasks</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
