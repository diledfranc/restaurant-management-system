import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Phone, Mail, User, Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservations', href: '/reservations' },
];

interface Reservation {
    id: number;
    guest_name: string;
    guest_phone: string;
    guest_email?: string;
    party_size: number;
    reservation_time: string;
    table_number?: string;
    status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
    notes?: string;
}

interface Props {
    reservations: Reservation[];
    filters: {
        date?: string;
        status?: string;
    };
}

export default function ReservationsIndex({ reservations, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const { data, setData, post, processing, reset, errors } = useForm({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        party_size: 2,
        reservation_time: '',
        notes: '',
    });

    const handleFilterChange = (key: string, value: string) => {
        router.get('/reservations', { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reservations', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            }
        });
    };

    const updateStatus = (id: number, status: string) => {
        router.put(`/reservations/${id}`, { status }, { preserveScroll: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'seated': return 'bg-blue-500';
            case 'cancelled': return 'bg-red-500';
            case 'completed': return 'bg-gray-500';
            default: return 'bg-yellow-500';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold">Reservations</h2>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Reservation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Reservation</DialogTitle>
                                <DialogDescription>
                                    Enter guest details to book a table.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="guest_name">Guest Name</Label>
                                    <Input
                                        id="guest_name"
                                        value={data.guest_name}
                                        onChange={(e) => setData('guest_name', e.target.value)}
                                        required
                                    />
                                    {errors.guest_name && <span className="text-red-500 text-sm">{errors.guest_name}</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="guest_phone">Phone</Label>
                                        <Input
                                            id="guest_phone"
                                            value={data.guest_phone}
                                            onChange={(e) => setData('guest_phone', e.target.value)}
                                            required
                                        />
                                        {errors.guest_phone && <span className="text-red-500 text-sm">{errors.guest_phone}</span>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="party_size">Party Size</Label>
                                        <Input
                                            id="party_size"
                                            type="number"
                                            min="1"
                                            value={data.party_size}
                                            onChange={(e) => setData('party_size', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reservation_time">Date & Time</Label>
                                    <Input
                                        id="reservation_time"
                                        type="datetime-local"
                                        value={data.reservation_time}
                                        onChange={(e) => setData('reservation_time', e.target.value)}
                                        required
                                    />
                                    {errors.reservation_time && <span className="text-red-500 text-sm">{errors.reservation_time}</span>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Reservation'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center bg-muted/20 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                handleFilterChange('date', e.target.value);
                            }}
                            className="w-full sm:w-[180px]"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select 
                            value={statusFilter} 
                            onValueChange={(val) => {
                                setStatusFilter(val);
                                handleFilterChange('status', val);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="seated">Seated</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reservations.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No reservations found for this date.
                        </div>
                    ) : (
                        reservations.map((res) => (
                            <Card key={res.id} className="overflow-hidden">
                                <div className={`h-2 w-full ${getStatusColor(res.status)}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{res.guest_name}</CardTitle>
                                        <Badge variant="outline" className="capitalize">
                                            {res.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{format(new Date(res.reservation_time), 'h:mm a')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{res.party_size} Guests</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{res.guest_phone}</span>
                                    </div>
                                    {res.notes && (
                                        <div className="bg-muted p-2 rounded text-xs italic">
                                            "{res.notes}"
                                        </div>
                                    )}
                                    
                                    <div className="pt-2 flex gap-2 justify-end border-t mt-2">
                                        {res.status === 'pending' && (
                                            <>
                                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => updateStatus(res.id, 'cancelled')}>
                                                    Cancel
                                                </Button>
                                                <Button size="sm" onClick={() => updateStatus(res.id, 'confirmed')}>
                                                    Confirm
                                                </Button>
                                            </>
                                        )}
                                        {res.status === 'confirmed' && (
                                            <Button size="sm" onClick={() => updateStatus(res.id, 'seated')}>
                                                Mark Seated
                                            </Button>
                                        )}
                                        {res.status === 'seated' && (
                                            <Button size="sm" variant="outline" onClick={() => updateStatus(res.id, 'completed')}>
                                                Complete
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
