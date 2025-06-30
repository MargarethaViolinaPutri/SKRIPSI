import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { ClassRoom } from '@/types/classroom';
import { Link, useForm } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Plus, Trash } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useState } from 'react';

export default function ClassRoomIndex() {
    const { processing, delete: destroy } = useForm();
    const [id, setId] = useState<any>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<ClassRoom[]>>(route('master.classroom.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<ClassRoom>();

    const onDelete = async (e: FormEvent) => {
        e.preventDefault();
        if (id === null) {
            setId(null);
            return;
        }
        try {
            await destroy(route('master.classroom.destroy', { id }));
            setId(null);
            setRefreshKey((oldKey) => oldKey + 1);
            console.log('Delete successful');
        } catch (error) {
            console.error('Delete failed', error);
            alert('Delete failed: ' + (error?.message || 'Unknown error'));
        }
    };

    const handleDelete = useCallback((classRoomId: any) => {
        setId(classRoomId);
    }, []);

    const columns: ColumnDef<ClassRoom, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('level', {
            id: 'level',
            header: 'Level',
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
        }),
        helper.accessor('code', {
            id: 'code',
            header: 'Code',
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
                            <Link href={route('master.classroom.show', { id: row.original.id })}>
                                <DropdownMenuItem>
                                    <Eye /> Detail
                                </DropdownMenuItem>
                            </Link>
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
                        <DialogTitle>Delete Class Room</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this class room? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <form onSubmit={onDelete}>
                            <Button variant="outline" onClick={() => setId(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" type="submit">
                                Delete
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">Class Room</h1>
                    <p className="text-sm">Manage All System Class Room</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.classroom.create')}>
                        <Button variant="blue">
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="my-4">
                <NextTable<ClassRoom>
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

ClassRoomIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
