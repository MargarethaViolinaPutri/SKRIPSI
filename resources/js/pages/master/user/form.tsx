import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

type UserFormProps = {
    user?: User;
};

export default function UserForm({ user }: UserFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<any>({
        name: user?.name,
        email: user?.email,
        role: user?.roles[0].name ?? '',
        password: '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (user) {
            put(route('master.user.update', user.id), FormResponse);
        } else {
            post(route('master.user.store'), FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.target.value)} />
                <InputError message={errors?.name} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input placeholder="Email" value={data.email} onChange={(v) => setData('email', v.target.value)} />
                <InputError message={errors?.email} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="teacher">teacher</SelectItem>
                        <SelectItem value="student">student</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors?.email} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Password</Label>
                <PasswordInput placeholder="Password" value={data.password} onChange={(v) => setData('password', v.target.value)} />
                <InputError message={errors?.password} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Password Confirmation</Label>
                <PasswordInput
                    placeholder="Password"
                    value={data.password_confirmation}
                    onChange={(v) => setData('password_confirmation', v.target.value)}
                />
                <InputError message={errors?.password_confirmation} />
            </div>
            <div className="col-span-12">
                <Button disabled={processing} variant="success">
                    {processing && <Loader className="mr-2 animate-spin" />}
                    Submit
                </Button>
                <Button variant="outline" disabled={processing} asChild>
                    <Link href={route('master.user.index')}>Back</Link>
                </Button>
            </div>
        </form>
    );
}

UserForm.layout = (page: ReactNode) => <AppLayout children={page} />;
