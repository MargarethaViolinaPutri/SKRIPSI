import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { Course } from '@/types/course';
import { Link, useForm } from '@inertiajs/react';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

type CourseFormProps = {
    course?: Course;
};

export default function CourseForm({ course }: CourseFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<Course>(course);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (course) {
            put(route('master.course.update', course.id), FormResponse);
        } else {
            post(route('master.course.store'), FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
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
            <div className="col-span-12 flex flex-row gap-2">
                <Button variant="outline" disabled={processing} asChild>
                    <Link href={route('master.course.index')}>Back</Link>
                </Button>
                <Button disabled={processing}>
                    {processing && <Loader className="mr-2 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    );
}

CourseForm.layout = (page: ReactNode) => <AppLayout children={page} />;
