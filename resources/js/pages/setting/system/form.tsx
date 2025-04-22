import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Setting } from '@/types/setting';
import { useForm } from '@inertiajs/react';
import { FileQuestion } from 'lucide-react';

type SystemFormProps = {
    setting?: Setting;
};

export default function SystemForm({ setting }: SystemFormProps) {
    const { data, setData, processing, post, put } = useForm(setting);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (setting) {
            put(route('setting.system.update', setting.id), {});
        } else {
            post(route('setting.system.store'), {});
        }
    };

    return (
        <>
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">System Setting Form</h1>
                    <p className="text-sm">Add New System Setting</p>
                </div>
                <Button variant="outline">
                    <FileQuestion />
                </Button>
            </div>
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4 my-4">
                <div className="col-span-6 flex flex-col gap-y-1.5">
                    <Label>Key</Label>
                    <Input value={data.key} onChange={(e) => setData('key', e.target.value)} />
                </div>
                <div className="col-span-6 flex flex-col gap-y-1.5">
                    <Label>Value</Label>
                    <Input value={data.value} onChange={(e) => setData('value', e.target.value)} />
                </div>
                <div className="col-span-12">
                    <Button disabled={processing} type="submit">
                        Submit
                    </Button>
                </div>
            </form>
        </>
    );
}

SystemForm.layout = (page: React.ReactNode) => <AppLayout children={page} />;
