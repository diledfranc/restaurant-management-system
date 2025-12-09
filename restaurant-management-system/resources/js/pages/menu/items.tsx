import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '#' },
    { title: 'Items', href: '#' },
];

export default function MenuItemsPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Items" />
            <div className="p-4">
                <div className="rounded-xl border p-4">Menu items scaffold — create, edit and delete UI here.</div>
                <div className="relative mt-4 min-h-[40vh] overflow-hidden rounded-xl border p-4">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
