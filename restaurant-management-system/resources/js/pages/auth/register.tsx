import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
                export default function RegisterPage() {
                    return (
                        <AuthLayout>
                            <Head title="Register" />
                            <div className="p-4 max-w-md mx-auto">
                                <h2 className="text-2xl font-bold mb-4">Register</h2>
                                <form className="space-y-3">
                                    <div>
                                        <label className="block font-medium mb-1">Name</label>
                                        <input type="text" className="w-full border rounded px-3 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Email</label>
                                        <input type="email" className="w-full border rounded px-3 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Password</label>
                                        <input type="password" className="w-full border rounded px-3 py-2" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1">Confirm Password</label>
                                        <input type="password" className="w-full border rounded px-3 py-2" required />
                                    </div>
                                    <button type="submit" className="w-full bg-primary text-white py-2 rounded font-semibold">Register</button>
                                </form>
                            </div>
                        </AuthLayout>
                    );
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
