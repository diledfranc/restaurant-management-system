
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff', href: '/staff' },
];

interface Staff {
    id: number;
    name: string;
    role: string;
}

export default function StaffIndex() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            try {
                // Replace with your API endpoint
                const response = await fetch('/api/staff');
                if (response.ok) {
                    const data = await response.json();
                    setStaff(Array.isArray(data?.data) ? data.data : data);
                }
            } catch (error) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff" />
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Staff</h2>
                {loading ? (
                    <Spinner />
                ) : staff.length === 0 ? (
                    <div className="rounded-xl border p-4 text-center">No staff found.</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {staff.map((person) => (
                            <Card key={person.id}>
                                <CardHeader>
                                    <CardTitle>{person.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-2">Role: {person.role}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Edit</Button>
                                        <Button variant="destructive" size="sm">Delete</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
