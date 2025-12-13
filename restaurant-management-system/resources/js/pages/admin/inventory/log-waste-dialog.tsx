import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

interface IngredientBatch {
    id: number;
    batch_number: string | null;
    quantity: number;
    expiration_date: string | null;
}

interface Ingredient {
    id: number;
    name: string;
    unit: string;
    batches?: IngredientBatch[];
}

interface Props {
    ingredient: Ingredient | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function LogWasteDialog({ ingredient, isOpen, onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: 0,
        reason: '',
        notes: '',
        ingredient_batch_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient) return;

        post(route('inventory.waste', ingredient.id), {
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
                    <DialogTitle>Log Waste: {ingredient?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity Wasted ({ingredient?.unit})</Label>
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
                        <Label htmlFor="batch">Batch (Optional)</Label>
                        <Select
                            value={data.ingredient_batch_id}
                            onValueChange={(val) => setData('ingredient_batch_id', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a batch (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any / FIFO</SelectItem>
                                {ingredient?.batches?.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id.toString()}>
                                        {batch.batch_number ? `Batch ${batch.batch_number}` : `Received ${batch.received_at}`} 
                                        (Qty: {batch.quantity}, Exp: {batch.expiration_date || 'N/A'})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.ingredient_batch_id && <p className="text-sm text-red-500">{errors.ingredient_batch_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Select
                            value={data.reason}
                            onValueChange={(val) => setData('reason', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="spoiled">Spoiled</SelectItem>
                                <SelectItem value="spilled">Spilled / Damaged</SelectItem>
                                <SelectItem value="mistake">Preparation Mistake</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={processing}>Log Waste</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
