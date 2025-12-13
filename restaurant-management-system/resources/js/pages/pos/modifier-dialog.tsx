import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Modifier {
    id: number;
    name: string;
    price_cents: number;
    is_available: boolean;
}

interface ModifierGroup {
    id: number;
    name: string;
    is_required: boolean;
    is_multiple: boolean;
    modifiers: Modifier[];
}

interface MenuItem {
    id: number;
    name: string;
    price_cents: number;
    modifier_groups?: ModifierGroup[];
}

interface Props {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (modifiers: { modifier_id: number, price_cents: number, name: string }[]) => void;
}

export default function ModifierDialog({ item, isOpen, onClose, onConfirm }: Props) {
    const [selections, setSelections] = useState<Record<number, number[]>>({}); // group_id -> modifier_ids[]

    useEffect(() => {
        if (isOpen) {
            setSelections({});
        }
    }, [isOpen, item]);

    if (!item) return null;

    const handleToggle = (groupId: number, modId: number, isMultiple: boolean) => {
        setSelections(prev => {
            const current = prev[groupId] || [];
            if (isMultiple) {
                if (current.includes(modId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== modId) };
                } else {
                    return { ...prev, [groupId]: [...current, modId] };
                }
            } else {
                // Single selection (Radio)
                return { ...prev, [groupId]: [modId] };
            }
        });
    };

    const isValid = () => {
        if (!item.modifier_groups) return true;
        for (const group of item.modifier_groups) {
            if (group.is_required) {
                if (!selections[group.id] || selections[group.id].length === 0) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleConfirm = () => {
        const result: { modifier_id: number, price_cents: number, name: string }[] = [];
        
        item.modifier_groups?.forEach(group => {
            const selectedIds = selections[group.id] || [];
            selectedIds.forEach(modId => {
                const mod = group.modifiers.find(m => m.id === modId);
                if (mod) {
                    result.push({
                        modifier_id: mod.id,
                        price_cents: mod.price_cents,
                        name: mod.name
                    });
                }
            });
        });

        onConfirm(result);
    };

    const formatCurrency = (cents: number) => `฿${(cents / 100).toFixed(2)}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Customize {item.name}</DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {item.modifier_groups?.map(group => (
                            <div key={group.id} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-lg">{group.name}</h3>
                                    {group.is_required && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Required</span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    {group.modifiers.map(mod => (
                                        <div key={mod.id} className="flex items-center justify-between space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleToggle(group.id, mod.id, group.is_multiple)}>
                                            <div className="flex items-center space-x-2">
                                                {group.is_multiple ? (
                                                    <Checkbox 
                                                        checked={(selections[group.id] || []).includes(mod.id)}
                                                        onCheckedChange={() => handleToggle(group.id, mod.id, group.is_multiple)}
                                                    />
                                                ) : (
                                                    <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${selections[group.id]?.includes(mod.id) ? 'bg-primary' : ''}`}>
                                                        {selections[group.id]?.includes(mod.id) && <div className="h-2 w-2 rounded-full bg-white" />}
                                                    </div>
                                                )}
                                                <Label className="cursor-pointer">{mod.name}</Label>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {mod.price_cents > 0 ? `+${formatCurrency(mod.price_cents)}` : 'Free'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(!item.modifier_groups || item.modifier_groups.length === 0) && (
                            <p className="text-muted-foreground text-center py-4">No modifiers available for this item.</p>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!isValid()}>Add to Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
