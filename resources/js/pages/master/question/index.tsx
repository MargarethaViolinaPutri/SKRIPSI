import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Question } from '@/types/question';
import { Link, useForm } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useState } from 'react';

export default function QuestionIndex() {
    const { processing, delete: destroy } = useForm();
    const [id, setId] = useState<any>(null);

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Question[]>>(route('master.question.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<Question>();

    const onDelete = (e: FormEvent, id: any) => {
        e.preventDefault();
        destroy(route('master.question.destroy', { id: id }));
    };

    const handleDelete = useCallback((questionId: any) => {
        setId(questionId);
    }, []);

    const columns: ColumnDef<Question, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('module.id', {
            id: 'module',
            header: 'Module',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.module?.name,
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
            cell: ({ row }) => {
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
                        <DialogTitle>Delete Question</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this question? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <form onSubmit={(e) => onDelete(e, id)}>
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
                    <h1 className="text-lg font-medium">Question</h1>
                    <p className="text-sm">Manage All System Question</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('master.question.create')}>
                        <Button>
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="my-4">
                <NextTable<Question>
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

QuestionIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
