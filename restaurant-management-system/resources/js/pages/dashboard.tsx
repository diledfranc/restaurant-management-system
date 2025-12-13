import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import * as staff from '@/routes/staff';
import * as logs from '@/routes/logs';
import * as settings from '@/routes/settings';
import * as menu from '@/routes/menu';
import * as ordersRoute from '@/routes/orders';
import * as reports from '@/routes/reports';
import * as delivery from '@/routes/delivery';
import * as reservations from '@/routes/reservations';
import * as pos from '@/routes/pos';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Settings, Utensils, ShoppingBag, Truck, BarChart3, Calendar, Calculator, Info, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    table_number: string | null;
    created_at: string;
    items_count: number;
    customer_name: string;
    type: string;
}

interface DashboardProps extends SharedData {
    orders: Order[];
    stats: {
        total_sales: number;
        total_orders: number;
        avg_order_value: number;
    };
    best_selling: Array<{ name: string; total_sold: number }>;
    low_selling: Array<{ name: string; total_sold: number }>;
    sales_chart: Array<{ date: string; total: number }>;
    category_sales: Array<{ name: string; total: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard({ orders = [], stats, best_selling = [], low_selling = [], sales_chart = [], category_sales = [] }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const roles = (auth.roles as string[]) || [];

    const isAdmin = roles.includes('admin');
    const isManager = roles.includes('manager');
    const isStaff = roles.includes('staff');
    const isCashier = roles.includes('cashier');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['orders', 'stats'], preserveScroll: true });
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({ 
            only: ['orders', 'stats'], 
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false)
        });
    };

    // Group orders by status for the Kanban board
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');
    const outForDeliveryOrders = orders.filter(o => o.status === 'out_for_delivery');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Badge variant="outline" className="text-sm py-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Badge>
                    </div>
                </div>

                <Alert className="bg-muted/50 border-muted">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Welcome back, {auth.user.name}!</AlertTitle>
                    <AlertDescription>
                        You are logged in as {roles.join(', ')}.
                    </AlertDescription>
                </Alert>

                {/* Manager & Admin Analytics Section */}
                {(isManager || isAdmin) && stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sales (Today)</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.total_sales)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Daily revenue overview
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_orders}</div>
                                <p className="text-xs text-muted-foreground">
                                    Orders processed today
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(stats.avg_order_value)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Average spend per order
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{orders.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Currently in progress
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        {(isManager || isStaff) && <TabsTrigger value="live-orders">Live Orders</TabsTrigger>}
                        {(isManager || isAdmin) && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Admin Links */}
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

                            {/* Manager Links */}
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
                                    <Link href={ordersRoute.index().url}>
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
                                </>
                            )}

                            {/* Staff/Cashier Links */}
                            {(isStaff || isCashier) && (
                                <Link href={pos.index().url}>
                                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">POS System</CardTitle>
                                            <Calculator className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">Point of Sale</div>
                                            <p className="text-xs text-muted-foreground">Create new orders</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )}
                        </div>
                    </TabsContent>

                    {/* Live Orders Board */}
                    {(isManager || isStaff) && (
                        <TabsContent value="live-orders" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Pending Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Pending</h3>
                                        <Badge variant="secondary">{pendingOrders.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {pendingOrders.map(order => (
                                            <OrderCard key={order.id} order={order} formatCurrency={formatCurrency} />
                                        ))}
                                        {pendingOrders.length === 0 && <EmptyState />}
                                    </div>
                                </div>

                                {/* Preparing Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-blue-500 uppercase">Preparing</h3>
                                        <Badge variant="secondary">{preparingOrders.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {preparingOrders.map(order => (
                                            <OrderCard key={order.id} order={order} formatCurrency={formatCurrency} />
                                        ))}
                                        {preparingOrders.length === 0 && <EmptyState />}
                                    </div>
                                </div>

                                {/* Out for Delivery / Completed Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-orange-500 uppercase">Out for Delivery</h3>
                                        <Badge variant="secondary">{outForDeliveryOrders.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {outForDeliveryOrders.map(order => (
                                            <OrderCard key={order.id} order={order} formatCurrency={formatCurrency} />
                                        ))}
                                        {outForDeliveryOrders.length === 0 && <EmptyState />}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* Analytics Dashboard */}
                    {(isManager || isAdmin) && (
                        <TabsContent value="analytics" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Sales Overview</CardTitle>
                                        <CardDescription>
                                            Daily sales performance for the last 7 days.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={sales_chart}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="date" className="text-xs" />
                                                    <YAxis className="text-xs" tickFormatter={(value) => `₱${value}`} />
                                                    <Tooltip 
                                                        formatter={(value: number) => [`₱${value}`, 'Sales']}
                                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                                    />
                                                    <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Sales by Category</CardTitle>
                                        <CardDescription>
                                            Distribution of sales across menu categories.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={category_sales}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        paddingAngle={5}
                                                        dataKey="total"
                                                    >
                                                        {category_sales.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: number) => [`₱${value}`, 'Sales']} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Best Selling Items</CardTitle>
                                        <CardDescription>Top performing menu items.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {best_selling.map((item, i) => (
                                                <div key={i} className="flex items-center">
                                                    <div className="ml-4 space-y-1">
                                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                                    </div>
                                                    <div className="ml-auto font-medium">{item.total_sold} sold</div>
                                                </div>
                                            ))}
                                            {best_selling.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Low Selling Items</CardTitle>
                                        <CardDescription>Items that might need promotion.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {low_selling.map((item, i) => (
                                                <div key={i} className="flex items-center">
                                                    <div className="ml-4 space-y-1">
                                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                                    </div>
                                                    <div className="ml-auto font-medium">{item.total_sold} sold</div>
                                                </div>
                                            ))}
                                            {low_selling.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppLayout>
    );
}

function OrderCard({ order, formatCurrency }: { order: Order; formatCurrency: (val: number) => string }) {
    return (
        <Card className="p-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm">#{order.order_number}</span>
                <Badge variant="outline" className="text-xs">{order.type}</Badge>
            </div>
            <div className="text-sm mb-2">
                <p className="font-medium">{order.customer_name}</p>
                {order.table_number && <p className="text-muted-foreground text-xs">Table: {order.table_number}</p>}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 pt-2 border-t">
                <span>{order.items_count} items</span>
                <span className="font-semibold text-foreground">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="mt-2">
                 <Link href={ordersRoute.index().url} className="w-full block text-center text-xs bg-primary text-primary-foreground py-1 rounded hover:bg-primary/90">
                    Manage
                </Link>
            </div>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
            No orders
        </div>
    );
}
