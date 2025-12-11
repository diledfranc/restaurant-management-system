import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import CustomerLayout from '@/layouts/customer-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    const roles = auth.roles || [];
    const isStaff = roles.some(role => ['admin', 'manager', 'staff', 'cashier', 'kitchen'].includes(role));

    if (!isStaff) {
        return (
            <CustomerLayout>
                {children}
            </CustomerLayout>
        );
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
