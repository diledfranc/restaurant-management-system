import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity Logs', href: '/logs' },
];

interface ActivityLog {
    id: number;
    user: string;
    action: string;
    description: string;
    ip_address: string;
    created_at: string;
}

interface LogsPageProps {
    logs: {
        data: ActivityLog[];
        links: any[];
    };
}

export default function LogsIndex({ logs }: LogsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">System Activity Logs</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Trail</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No activity logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.created_at}</TableCell>
                                            <TableCell>{log.user}</TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell className="max-w-md truncate" title={log.description}>
                                                {log.description}
                                            </TableCell>
                                            <TableCell>{log.ip_address}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination could be added here */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
