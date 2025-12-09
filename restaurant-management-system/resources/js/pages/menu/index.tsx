import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '#' },
];

export default function MenuIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border p-4">Menu categories list (scaffold)</div>
                    <div className="rounded-xl border p-4">Menu items list (scaffold)</div>
                </div>
                <div className="relative min-h-[40vh] overflow-hidden rounded-xl border p-4">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    <div className="relative z-10">Use `resources/js/routes/menu-items` and controllers to fetch data.</div>
                </div>
            </div>
        </AppLayout>
    );
}
