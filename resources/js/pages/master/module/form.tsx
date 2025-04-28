import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { fetchCourse } from '@/lib/select';
import { Module } from '@/types/module';
import { useForm } from '@inertiajs/react';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

type ModuleFormProps = {
    module?: Module;
};

export default function ModuleForm({ module }: ModuleFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<any>(module);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (module) {
            put(route('master.module.update', module.id), FormResponse);
        } else {
            post(route('master.module.store'), FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Course</Label>
                <MultiSelect
                    placeholder="Course"
                    name="course_id"
                    defaultValue={{ value: data.course_id, label: data.course?.name }}
                    onChange={(v) => setData('course_id', v.value)}
                    loadOptions={fetchCourse}
                />
                <InputError message={errors?.course_id} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.currentTarget.value)} />
                <InputError message={errors?.name} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea placeholder="Description" value={data.desc} onChange={(v) => setData('desc', v.currentTarget.value)} />
                <InputError message={errors?.desc} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>File</Label>
                <FileUpload accept="application/pdf" onFilesChange={(v) => setData('file', v)} />
                <InputError message={errors?.desc} />
            </div>
            <div className="col-span-12">
                <Button disabled={processing}>
                    {processing && <Loader className="mr-2 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    );
}

ModuleForm.layout = (page: ReactNode) => <AppLayout children={page} />;
