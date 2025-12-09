import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'System Settings', href: '/settings' },
];

interface SettingsPageProps {
    settings: Record<string, string>;
}

export default function SettingsIndex({ settings }: SettingsPageProps) {
    const form = useForm({
        restaurant_name: settings.restaurant_name || '',
        operating_hours: settings.operating_hours || '',
        offline_message: settings.offline_message || '',
        max_delivery_radius: settings.max_delivery_radius || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/settings', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">System Settings</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>General Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                                <Input
                                    id="restaurant_name"
                                    value={form.data.restaurant_name}
                                    onChange={(e) => form.setData('restaurant_name', e.target.value)}
                                />
                                <InputError message={form.errors.restaurant_name} />
                            </div>

                            <div>
                                <Label htmlFor="operating_hours">Operating Hours</Label>
                                <Input
                                    id="operating_hours"
                                    value={form.data.operating_hours}
                                    onChange={(e) => form.setData('operating_hours', e.target.value)}
                                    placeholder="e.g., Mon-Sun: 9am - 10pm"
                                />
                                <InputError message={form.errors.operating_hours} />
                            </div>

                            <div>
                                <Label htmlFor="offline_message">Offline Message</Label>
                                <Input
                                    id="offline_message"
                                    value={form.data.offline_message}
                                    onChange={(e) => form.setData('offline_message', e.target.value)}
                                    placeholder="Message shown when restaurant is closed"
                                />
                                <InputError message={form.errors.offline_message} />
                            </div>

                            <div>
                                <Label htmlFor="max_delivery_radius">Max Delivery Radius (km)</Label>
                                <Input
                                    id="max_delivery_radius"
                                    type="number"
                                    value={form.data.max_delivery_radius}
                                    onChange={(e) => form.setData('max_delivery_radius', e.target.value)}
                                />
                                <InputError message={form.errors.max_delivery_radius} />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.processing}>
                                    Save Settings
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
