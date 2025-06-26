import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Base } from '@/types/base';
import { Link, useForm } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Plus, Trash } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useState } from 'react';

function RoleHeader({
    currentParams,
    updateParams,
    disabled,
}: {
    currentParams: Record<string, unknown>;
    updateParams: (params: Record<string, unknown>) => void;
    disabled: boolean;
}) {
    const roleFilter = (currentParams['filter.role'] as string) || '';
    return (
        <div>
            <label htmlFor="role-filter" className="mr-2 font-medium">
                Role
            </label>
            <select
                id="role-filter"
                aria-label="Filter by role"
                onChange={(e) => {
                    updateParams({ 'filter.role': e.target.value || null });
                }}
                value={roleFilter}
                disabled={disabled}
                className="ml-2 rounded border px-1 disabled:opacity-50"
            >
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
            </select>
        </div>
    );
}

import { useMemo } from 'react';

export default function UserIndex() {
    const { processing, delete: destroy } = useForm();
    const [id, setId] = useState<any>(null);
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [customParams, setCustomParams] = useState<Record<string, unknown>>({});

    const load = useCallback(async (params: Record<string, unknown>): Promise<any> => {
        try {
            // Transform 'filter.role' to nested filter object for backend
            const transformedParams: Record<string, any> = {};
            Object.entries(params).forEach(([key, value]) => {
                if (key.startsWith('filter.')) {
                    const filterKey = key.split('.')[1];
                    if (!transformedParams['filter']) {
                        transformedParams['filter'] = {};
                    }
                    transformedParams['filter'][filterKey] = value;
                } else {
                    transformedParams[key] = value;
                }
            });

            const response = await axios.get<Base<User[]>>(route('master.user.fetch', transformedParams));
            console.log('User fetch response:', response.data);
            return response.data; // Return full response data with pagination
        } catch (error) {
            console.error('Error fetching users:', error);
            return { data: [], meta: {} };
        }
    }, []);

    const updateCustomParams = useCallback((newParams: Record<string, unknown>) => {
        setCustomParams((prev) => ({ ...prev, ...newParams }));
    }, []);

    const helper = createColumnHelper<User>();

    const onDelete = (e: FormEvent, id: any) => {
        e.preventDefault();
        destroy(route('master.user.destroy', { id: id }));
    };

    const handleDelete = useCallback((userId: any) => {
        setId(userId);
    }, []);

    const columns = useMemo<ColumnDef<User, any>[]>(
        () => [
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
                enableColumnFilter: false,
                cell: ({ row }) => {
                    const roles = row.original.roles;
                    if (!roles || roles.length === 0) return '';
                    return roles.map((role) => role.name).join(', ');
                },
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
                cell: ({ row }) => {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={processing}>
                                    Action
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                <Link href={route('master.user.show', { id: row.original.id })}>
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
        ],
        [helper, processing, handleDelete],
    );

    return (
        <div>
            <Dialog open={id != null} onOpenChange={(open) => !open && setId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <form onSubmit={(e) => onDelete(e, id)}>
                            <Button variant="outline" onClick={() => setId(null)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button variant="destructive" type="submit" disabled={processing}>
                                Delete
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">User</h1>
                    <p className="text-sm">Manage All System User</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.user.create')}>
                        <Button disabled={processing}>
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
                    filterComponent={
                        <RoleHeader
                            currentParams={customParams}
                            updateParams={updateCustomParams}
                            disabled={false} // NextTable manages loading internally, so no need to disable here
                        />
                    }
                    onParamsChange={(params) => {
                        const newRoleFilter = (params['filter.role'] as string) || null;
                        if (newRoleFilter !== roleFilter) {
                            setRoleFilter(newRoleFilter);
                        }
                    }}
                />
            </div>
        </div>
    );
}

UserIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
