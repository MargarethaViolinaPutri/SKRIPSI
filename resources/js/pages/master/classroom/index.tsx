import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { ClassRoom } from '@/types/classroom';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';
import { ReactNode } from 'react';

export default function ClassRoomIndex() {
    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<ClassRoom[]>>(route('master.classroom.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<ClassRoom>();

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
            cell: () => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                            <DropdownMenuItem>
                                <Eye /> Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Pencil /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">Class Room</h1>
                    <p className="text-sm">Manage All System Class Room</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.classroom.create')}>
                        <Button>
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
