
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
];

interface Reservation {
    id: number;
    name: string;
    date: string;
    status: string;
}

export default function ReservationsIndex() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            try {
                // Replace with your API endpoint
                const response = await fetch('/api/reservations');
                if (response.ok) {
                    const data = await response.json();
                    setReservations(Array.isArray(data?.data) ? data.data : data);
                }
            } catch (error) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchReservations();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Reservations</h2>
                {loading ? (
                    <Spinner />
                ) : reservations.length === 0 ? (
                    <div className="rounded-xl border p-4 text-center">No reservations found.</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {reservations.map((res) => (
                            <Card key={res.id}>
                                <CardHeader>
                                    <CardTitle>{res.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-2">Date: {res.date}</p>
                                    <p className="mb-2">Status: {res.status}</p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View</Button>
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
