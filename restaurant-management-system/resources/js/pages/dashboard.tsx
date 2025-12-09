import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
                <div className="p-4">
                    <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border p-4">
                            <h3 className="font-semibold mb-2">Quick Links</h3>
                            <ul className="list-disc pl-4">
                                <li>Menu Management</li>
                                <li>Orders</li>
                                <li>Reservations</li>
                                <li>Reports</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border p-4">
                            <h3 className="font-semibold mb-2">Stats</h3>
                            <p>Show key metrics here (orders, sales, etc.).</p>
                        </div>
                        <div className="rounded-xl border p-4">
                            <h3 className="font-semibold mb-2">Recent Activity</h3>
                            <p>Show recent actions and updates.</p>
                        </div>
                    </div>
                </div>
        </AppLayout>
    );
}
