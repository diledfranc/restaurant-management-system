import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    cost_per_unit_cents: number;
}

interface Props {
    ingredient: Ingredient | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReceiveStockDialog({ ingredient, isOpen, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: 0,
        cost_per_unit_cents: 0,
        expiration_date: '',
        batch_number: '',
    });

    useEffect(() => {
        if (ingredient) {
            setData('cost_per_unit_cents', ingredient.cost_per_unit_cents);
        }
    }, [ingredient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient) return;

        post(route('inventory.receive', ingredient.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive Stock: {ingredient?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity Received ({ingredient?.unit})</Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.001"
                            value={data.quantity}
                            onChange={(e) => setData('quantity', parseFloat(e.target.value))}
                            required
                        />
                        {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cost">Cost per Unit (cents)</Label>
                        <Input
                            id="cost"
                            type="number"
                            value={data.cost_per_unit_cents}
                            onChange={(e) => setData('cost_per_unit_cents', parseInt(e.target.value))}
                            required
                        />
                        {errors.cost_per_unit_cents && <p className="text-sm text-red-500">{errors.cost_per_unit_cents}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                        <Input
                            id="expiration"
                            type="date"
                            value={data.expiration_date}
                            onChange={(e) => setData('expiration_date', e.target.value)}
                        />
                        {errors.expiration_date && <p className="text-sm text-red-500">{errors.expiration_date}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="batch">Batch Number (Optional)</Label>
                        <Input
                            id="batch"
                            type="text"
                            value={data.batch_number}
                            onChange={(e) => setData('batch_number', e.target.value)}
                        />
                        {errors.batch_number && <p className="text-sm text-red-500">{errors.batch_number}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Receive Stock</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
