import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '#' },
    { title: 'Order', href: '#' },
];

export default function OrderShow() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order" />
            <div className="p-4">
                <div className="rounded-xl border p-4">Order details scaffold — show order items and actions.</div>
                <div className="relative mt-4 min-h-[40vh] overflow-hidden rounded-xl border p-4">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
