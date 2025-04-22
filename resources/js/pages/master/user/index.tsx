import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Base } from '@/types/base';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';
import { ReactNode } from 'react';

export default function UserIndex() {
    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<User[]>>(route('master.user.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<User>();

    const columns: ColumnDef<User, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('email', {
            id: 'email',
            header: 'Email',
            enableColumnFilter: true,
        }),
        helper.accessor('name', {
            id: 'name',
            header: 'Name',
            enableColumnFilter: true,
        }),
        helper.accessor('roles', {
            id: 'roles',
            header: 'Role',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.roles?.map((role) => role.name).join(', '),
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
                    <h1 className="text-lg font-medium">User</h1>
                    <p className="text-sm">Manage All System User</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.user.create')}>
                        <Button>
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="my-4">
                <NextTable<User>
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

UserIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
