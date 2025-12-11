import { type PropsWithChildren, useEffect, useState } from 'react';
import CustomerNavbar from '@/components/customer-navbar';
import { Head } from '@inertiajs/react';

const CART_KEY = 'customer_cart';

export default function CustomerLayout({ children }: PropsWithChildren) {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            try {
                const stored = localStorage.getItem(CART_KEY);
                if (stored) {
                    const cart = JSON.parse(stored);
                    if (Array.isArray(cart)) {
                        const count = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
                        setCartCount(count);
                    }
                }
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        };
        
        updateCount();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <CustomerNavbar cartCount={cartCount} />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
