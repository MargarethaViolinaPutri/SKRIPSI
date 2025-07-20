import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { ClassRoom } from '@/types/classroom';
import { router, useForm, usePage } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import Select from 'react-select';

type Member = {
    id: number;
    name: string;
    email: string;
};

type User = {
    id: number;
    name: string;
};

export default function ClassroomDetail() {
    const { props } = usePage<{ classroom: ClassRoom; teachers: User[] }>();
    const classroom = props.classroom;
    const teachers = props.teachers;
    console.log('Loaded classroom teacher:', classroom.teacher);
    console.log('Loaded teachers:', teachers);

    const { processing, delete: destroy } = useForm();
    const [id, setId] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    console.log('selectedTeacherId:', selectedTeacherId);

    const selectedTeacherOption = teachers ? teachers.find((t) => t.id === selectedTeacherId) || null : null;

    type MembersResponse = {
        data: Member[];
    };

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<MembersResponse>(route('master.classroom.members.fetch', { id: classroom.id, ...params }));
        return {
            items: response.data.data,
            prev_page: null,
            current_page: null,
            next_page: null,
            total_page: null,
        };
    };

    useEffect(() => {
        setSelectedTeacherId(classroom.teacher?.id || null);
    }, [classroom.teacher]);

    const onTeacherChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('Teacher change event triggered');
        const newTeacherId = Number(e.target.value);
        setSelectedTeacherId(newTeacherId);
        try {
            const response = await axios.put(route('master.classroom.update', classroom.id), { user_id: newTeacherId });
            console.log('Update response:', response);
            // Reload page to refresh props
            router.reload();
        } catch (error) {
            console.error('Failed to update teacher', error);
            alert('Failed to update teacher');
        }
    };

    const helper = createColumnHelper<Member>();

    const onDelete = async (e: FormEvent) => {
        e.preventDefault();
        if (id === null) {
            setId(null);
            return;
        }
        try {
            await destroy(route('master.classroom.member.destroy', { id }));
            setId(null);
            setRefreshKey((oldKey) => oldKey + 1);
            console.log('Delete successful');
        } catch (error) {
            console.error('Delete failed', error);
            alert('Delete failed: ' + (error?.message || 'Unknown error'));
        }
    };

    const handleDelete = useCallback((memberId: any) => {
        setId(memberId);
    }, []);

    const columns: ColumnDef<Member, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),

        helper.accessor('name', {
            id: 'name',
            header: 'Name',
        }),

        helper.accessor('email', {
            id: 'email',
            header: 'Email',
        }),

        helper.display({
            id: 'actions',
            header: 'Actions',
            enableColumnFilter: false,
            enableHiding: false,
            enablePinning: true,
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                            <DropdownMenuItem onClick={() => handleDelete(row.original.id)}>
                                <Trash /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            meta: {
                variant: 'disabled',
            },
        }),
    ];

    return (
        <div>
            <Dialog open={id != null} onOpenChange={(open) => !open && setId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Student</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this student? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <form onSubmit={onDelete}>
                            <Button variant="outline" onClick={() => setId(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" type="submit" disabled={processing}>
                                Delete
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <h1 className="mb-4 text-2xl font-bold">{classroom.name}</h1>
            <label htmlFor="teacher-select" className="mb-2 block text-lg font-medium">
                Teacher:
            </label>
            <Select
                inputId="teacher-select"
                value={selectedTeacherOption}
                onChange={(selectedOption) => {
                    const newTeacherId = selectedOption ? selectedOption.id : null;
                    setSelectedTeacherId(newTeacherId);
                    if (newTeacherId !== null) {
                        axios
                            .put(route('master.classroom.update', classroom.id), {
                                user_id: newTeacherId,
                                name: classroom.name,
                                members: classroom.members.map((m) => ({ value: m.id })),
                            })
                            .then(() => {
                                router.reload();
                            })
                            .catch((error) => {
                                console.error('Failed to update teacher', error);
                                alert('Failed to update teacher');
                            });
                    }
                }}
                options={teachers}
                getOptionLabel={(e) => e.name}
                getOptionValue={(e) => String(e.id)}
                isClearable
                className="mb-4"
            />
            <div className="my-4">
                <NextTable<Member>
                    enableSelect={true}
                    load={load}
                    id={'id'}
                    columns={columns}
                    mode="table"
                    onSelect={(val) => {
                        console.log(val);
                    }}
                />
            </div>
        </div>
    );
}

ClassroomDetail.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
