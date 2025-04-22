import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Module } from '@/types/module';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';
import { ReactNode } from 'react';
import axios from 'axios';

export default function ModuleIndex() {
    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Module[]>>(route('master.module.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<Module>();

    const columns: ColumnDef<Module, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('course.id', {
            id: 'course',
            header: 'Course',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.course?.name,
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.name,
        }),
        helper.display({
            id: 'created_at',
            header: 'Created At',
            enableColumnFilter: false,
            cell: ({ row }) => format(parseISO(row.original.created_at), 'dd, MMM yyyy'),
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
                    <h1 className="text-lg font-medium">Module</h1>
                    <p className="text-sm">Manage All System Module</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.module.create')}>
                        <Button>
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="my-4">
                <NextTable<Module>
                    enableSelect={true}
                    load={load}
                    id={'id'}
                    columns={columns}
                    mode="table"
                    // filterComponent={<FilterComponent />}
                    onSelect={(val) => {
                        console.log(val);
                    }}
                />
            </div>
        </div>
    );
}

ModuleIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
