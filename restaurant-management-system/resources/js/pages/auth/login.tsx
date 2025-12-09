import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
        return (
            <AuthLayout
                title="Log in to your account"
                description="Enter your email and password below to log in"
            >
                <Head title="Login" />
                <div className="p-4 max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Login</h2>
                    <form className="space-y-3">
                        <div>
                            <label className="block font-medium mb-1">Email</label>
                            <input type="email" className="w-full border rounded px-3 py-2" required />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Password</label>
                            <input type="password" className="w-full border rounded px-3 py-2" required />
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded font-semibold">Log In</button>
                    </form>
                </div>
            </AuthLayout>
        );
}
