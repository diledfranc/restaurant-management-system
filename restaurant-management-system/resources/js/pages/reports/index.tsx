import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

type SalesRow = {
    day: string;
    total_cents: number;
    orders_count: number;
};

type LowSellingRow = {
    menu_item_id: number;
    name?: string | null;
    total_sold: number;
};

type ReportsPageProps = {
    summary: {
        from: string;
        to: string;
        total_cents: number;
        orders_count: number;
        avg_order_cents: number;
    };
    sales: SalesRow[];
    lowSelling: LowSellingRow[];
};

const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;

export default function ReportsIndex() {
    const { summary, sales, lowSelling } = usePage<ReportsPageProps>().props;
    const [from, setFrom] = useState(summary.from);
    const [to, setTo] = useState(summary.to);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports', { from, to }, { preserveState: true, replace: true });
    };

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

                <div className="grid gap-4 md:grid-cols-3">
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
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>Sales trend</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-3 text-sm font-semibold text-muted-foreground">
                                <span>Date</span>
                                <span className="text-right">Orders</span>
                                <span className="text-right">Revenue</span>
                            </div>
                            <div className="divide-y">
                                {sales.length === 0 && (
                                    <p className="py-2 text-sm text-muted-foreground">No sales in this range.</p>
                                )}
                                {sales.map((row) => (
                                    <div key={row.day} className="grid grid-cols-3 py-1 text-sm">
                                        <span>{row.day}</span>
                                        <span className="text-right">{row.orders_count}</span>
                                        <span className="text-right">{formatCurrency(row.total_cents)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>Low-selling items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 text-sm font-semibold text-muted-foreground">
                                <span>Item</span>
                                <span className="text-right">Units sold</span>
                            </div>
                            <div className="divide-y">
                                {lowSelling.length === 0 && (
                                    <p className="py-2 text-sm text-muted-foreground">No items in this range.</p>
                                )}
                                {lowSelling.map((row) => (
                                    <div key={row.menu_item_id} className="grid grid-cols-2 py-1 text-sm">
                                        <span>{row.name ?? 'Item #' + row.menu_item_id}</span>
                                        <span className="text-right">{row.total_sold}</span>
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
