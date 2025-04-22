import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { fetchUser } from '@/lib/select';
import { ClassRoom } from '@/types/classroom';
import { useForm } from '@inertiajs/react';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';

type ClassRoomFormProps = {
    classroom?: ClassRoom;
};

type ClassFormData = {
    user_id: string;
    name: string;
    level: string;
    code: string;
    members: string[];
};

export default function ClassRoomForm({ classroom }: ClassRoomFormProps) {
    const { data, setData, post, put, errors, processing } = useForm<ClassFormData>();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // data.members = data.members.map((v) => v);

        console.log(data.members);

        if (classroom) {
            put(route('master.classroom.update', classroom.id), FormResponse);
        } else {
            post(route('master.classroom.store'), FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Teacher</Label>
                <MultiSelect placeholder="Members" name="members" loadOptions={fetchUser} onChange={(v) => setData('user_id', v.value)} />
                <InputError message={errors?.user_id} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input placeholder="Name" value={data.name} onChange={(v) => setData('name', v.target.value)} />
                <InputError message={errors?.name} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Code</Label>
                <Input placeholder="Code" value={data.code} onChange={(v) => setData('code', v.target.value)} />
                <InputError message={errors?.code} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Level</Label>
                <Input placeholder="Level" value={data.level} onChange={(v) => setData('level', v.target.value)} />
                <InputError message={errors?.level} />
            </div>
            <div className="col-span-12 flex flex-col gap-1.5">
                <Label>Members</Label>
                <MultiSelect
                    placeholder="Members"
                    name="members"
                    isMulti={true}
                    loadOptions={fetchUser}
                    value={data.members}
                    onChange={(v) => setData('members', v)}
                />
                {/* <InputError message={errors?.members} /> */}
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

ClassRoomForm.layout = (page: ReactNode) => <AppLayout children={page} />;
