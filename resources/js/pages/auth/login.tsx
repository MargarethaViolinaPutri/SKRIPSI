import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type LoginForm = {
    email: string;
    password: string;
};

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('auth.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/images/login.png"
                    alt="Coding Ilustration"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <form onSubmit={onSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-start gap-2 text-center">
                                <h1 className="text-2xl font-bold">Login to your account</h1>
                                <p className="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={data.email}
                                        onChange={(v) => setData('email', v.currentTarget.value)}
                                        autoComplete="one-time-code"
                                        type="email"
                                        required
                                    />
                                    <InputError message={errors?.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        value={data.password}
                                        onChange={(v) => setData('password', v.currentTarget.value)}
                                        autoComplete="one-time-code"
                                        required
                                    />
                                    <InputError message={errors?.password} />
                                </div>
                                <Button disabled={processing} type="submit" className="w-full">
                                    Login
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
