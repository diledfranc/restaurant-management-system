import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

type SalesRow = {
    day: string;
    total_cents: number;
    total_cost: number;
    gross_profit: number;
    orders_count: number;
};

type ItemRow = {
    menu_item_id: number;
    name?: string | null;
    total_sold: number;
};

type WasteRow = {
    day: string;
    total_loss: number;
};

type WastedItemRow = {
    ingredient_name: string;
    unit: string;
    total_loss: number;
    total_quantity: number;
};

type ReportsPageProps = {
    summary: {
        from: string;
        to: string;
        total_cents: number;
        total_cost: number;
        total_waste: number;
        gross_profit: number;
        net_profit_estimate: number;
        orders_count: number;
        avg_order_cents: number;
        profit_margin: number;
    };
    sales: SalesRow[];
    waste: WasteRow[];
    topSelling: ItemRow[];
    lowSelling: ItemRow[];
    topWasted: WastedItemRow[];
};

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;

export default function ReportsIndex() {
    const { summary, sales, waste, topSelling, lowSelling, topWasted } = usePage<ReportsPageProps>().props;
    const [from, setFrom] = useState(summary.from);
    const [to, setTo] = useState(summary.to);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports', { from, to }, { preserveState: true, replace: true });
    };

    // Prepare data for charts
    const salesData = sales.map(s => ({
        ...s,
        revenue: s.total_cents / 100,
        cost: s.total_cost / 100,
        profit: s.gross_profit / 100,
    }));

    const wasteData = waste.map(w => ({
        ...w,
        loss: w.total_loss / 100,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <form
                    onSubmit={handleFilter}
                    className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-end"
                >
                    <div className="space-y-1">
                        <Label htmlFor="from">From</Label>
                        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="to">To</Label>
                        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label className="invisible">Submit</Label>
                        <Button type="submit" className="w-full sm:w-auto">Update</Button>
                    </div>
                </form>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(summary.total_cents)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gross Profit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.gross_profit)}</p>
                            <p className="text-xs text-muted-foreground">Margin: {summary.profit_margin}%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{summary.orders_count}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Avg order value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(summary.avg_order_cents)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Waste</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_waste)}</p>
                            <p className="text-xs text-muted-foreground">Net Profit Est: {formatCurrency(summary.net_profit_estimate)}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => [`฿${value}`, '']} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                                    <Line type="monotone" dataKey="cost" stroke="#ff7300" name="Cost" />
                                    <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Waste Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wasteData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `฿${value}`} />
                                    <Legend />
                                    <Bar dataKey="loss" fill="#dc2626" name="Waste Loss" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Items</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={topSelling} margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="total_sold" fill="#82ca9d" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Low Selling Items</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={lowSelling} margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="total_sold" fill="#ff8042" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Wasted Ingredients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topWasted.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{item.ingredient_name}</p>
                                            <p className="text-xs text-muted-foreground">{item.total_quantity} {item.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-bold">{formatCurrency(item.total_loss)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
