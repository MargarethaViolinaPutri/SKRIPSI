import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import type { Base } from '@/types/base';
import type { Test } from '@/types/test';
import { Link, useForm } from '@inertiajs/react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Plus, Trash } from 'lucide-react';
import { type FormEvent, type ReactNode, useCallback, useMemo, useState } from 'react';

export default function ManageTest() {
    const helper = createColumnHelper<Test>();
    const {
        data,
        setData,
        processing,
        put,
        delete: destroy,
    } = useForm({
        threshold: '',
    });
    const [id, setId] = useState<any>(null);

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Test[]>>(route('master.test.fetch', params));
        return response.data;
    };

    const onDelete = (e: FormEvent, id: any) => {
        e.preventDefault();
        destroy(route('master.test.destroy', { id: id }));
    };

    const onUpdateThreshold = (e: FormEvent) => {
        e.preventDefault();
        if (!data.threshold) {
            alert('Threshold is required');
            return;
        }
        put(route('master.course.update.threshold', { id: 1 }), {
            onSuccess: () => {
                alert('Threshold updated successfully');
            },
            onError: () => {
                alert('Failed to update threshold');
            },
        });
    };

    // Extract the delete handler to prevent re-renders
    const handleDelete = useCallback((testId: any) => {
        setId(testId);
    }, []);

    const columns: ColumnDef<Test, any>[] = useMemo(
        () => [
            helper.accessor('id', {
                id: 'id',
                header: 'ID',
                enableColumnFilter: false,
                enableHiding: false,
            }),
            helper.accessor('name', {
                id: 'name',
                header: 'Name',
                enableColumnFilter: true,
                cell: ({ row }) => row.original.name,
            }),
            helper.accessor('description', {
                id: 'description',
                header: 'Description',
                enableColumnFilter: true,
                cell: ({ row }) => row.original.description,
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
                                <Button variant="outline" size="sm">
                                    Action
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                                <Link href={route('master.test.show', { id: row.original.id })}>
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
        [handleDelete, route, id], // Include handleDelete in the dependency array
    );

    return (
        <div>
            <Dialog open={id != null} onOpenChange={(open) => !open && setId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Test</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this test? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <form onSubmit={(e) => onDelete(e, id)}>
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
            <div className="flex flex-row items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">Test</h1>
                    <p className="text-sm">Manage All System Test</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.test.create')}>
                        <Button variant="blue">
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <form onSubmit={onUpdateThreshold} className="my-4 flex flex-row items-center gap-2">
                <input
                    type="number"
                    min={0}
                    placeholder="Threshold"
                    value={data.threshold}
                    onChange={(e) => setData('threshold', e.target.value)}
                    className="w-32 rounded border border-gray-300 px-3 py-2"
                    required
                />
                <Button type="submit" disabled={processing}>
                    Update Threshold
                </Button>
            </form>
            <div className="my-4">
                <NextTable<Test>
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

ManageTest.layout = (page: ReactNode) => <AppLayout children={page} />;
