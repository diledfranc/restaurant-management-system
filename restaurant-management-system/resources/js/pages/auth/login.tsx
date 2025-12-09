import { FormEventHandler, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { Form, Head, useForm } from '@inertiajs/react';

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
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Login" />
            <div className="p-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Login</h2>

                {status && (
                    <div className="mb-4 font-medium text-sm text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="block font-medium mb-1">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.currentTarget.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="block font-medium mb-1">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.currentTarget.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e)}
                        />
                        <Label htmlFor="remember" className="ml-2 text-sm">
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full"
                    >
                        {processing ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Logging in...
                            </>
                        ) : (
                            'Log In'
                        )}
                    </Button>
                </form>

                <div className="mt-6 space-y-2 text-center text-sm">
                    {canResetPassword && (
                        <TextLink href="/forgot-password">
                            Forgot your password?
                        </TextLink>
                    )}
                    {canRegister && (
                        <div>
                            Don't have an account?{' '}
                            <TextLink href="/register">
                                Register
                            </TextLink>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
}
