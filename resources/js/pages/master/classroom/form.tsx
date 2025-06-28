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
import axios from 'axios';
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

    // Wrapper function to filter users to only teacher role
    const fetchTeacher = async (inputValue: string) => {
        const users = await fetchUser(inputValue);
        return users.filter((user: any) => user.label?.toLowerCase() === 'teacher' || user.role?.toLowerCase() === 'teacher');
    };

    // Wrapper function to filter users to only student role and exclude those already assigned to a class
    const fetchStudent = async (inputValue: string) => {
        const response = await axios.get(route('master.user.fetch'), {
            params: {
                'filter[name]': inputValue,
                'filter[extend_assigned]': true, // Request extended data with class_rooms_count
            },
        });
        const users = response.data.items ?? [];
        // Filter users to only those with role student and exclude assigned students
        const filteredUsers = users.filter(
            (e: any) => e.roles?.some((role: any) => role.name.toLowerCase() === 'student') && e.class_rooms_count === 0,
        );
        return filteredUsers.map((e: any) => ({
            value: e.id,
            label: e.name,
        }));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
                <MultiSelect placeholder="Members" name="members" loadOptions={fetchTeacher} onChange={(v) => setData('user_id', v.value)} />
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
                <Label>Students</Label>
                <MultiSelect
                    placeholder="Members"
                    name="members"
                    isMulti={true}
                    loadOptions={async (inputValue: string) => {
                        const fetched = await fetchStudent(inputValue);
                        // Merge selected members with fetched to ensure selected are visible
                        const selected = data.members || [];
                        const merged = [...selected];
                        fetched.forEach((item) => {
                            if (!selected.find((s: any) => s.value === item.value)) {
                                merged.push(item);
                            }
                        });
                        return merged;
                    }}
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
