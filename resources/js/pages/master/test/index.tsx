import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Course } from '@/types/course';
import { Test } from '@/types/test';
import { router, useForm } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Edit, Eye, Plus, Trash } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import TestForm from './form';

interface Props {
    courses: Course[];
}
export default function TestIndex({ courses }: Props) {
    const { delete: destroy } = useForm();
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [isDetail, setIsDetail] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Test[]>>(route('master.test.fetch', params));
        return response.data;
    };

    const handleCreate = () => {
        setSelectedTest(null);
        setIsDetail(true);
    };

    const handleDetail = async (testId: number) => {
        try {
            const response = await axios.get(route('master.test.show', { id: testId }));
            setSelectedTest(response.data.test);
            setIsDetail(true);
        } catch (error) {
            console.error('Failed to load test detail:', error);
        }
    };

    const onDelete = (e: FormEvent) => {
        e.preventDefault();
        if (idToDelete) {
            destroy(route('master.test.destroy', { id: idToDelete }), {
                onSuccess: () => setIdToDelete(null),
            });
        }
    };

    const helper = createColumnHelper<Test>();
    const columns: ColumnDef<Test, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            size: 60,
        }),
        helper.accessor('course.name', {
            id: 'course',
            header: 'Course',
            cell: (info) => info.getValue(),
        }),
        helper.accessor('title', {
            id: 'title',
            header: 'Title',
            size: 300,
        }),
        helper.accessor('type', {
            id: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
        }),
        helper.accessor('status', {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const isPublished = row.original.status === 'published';
                return (
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                            isPublished
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {row.original.status}
                    </span>
                );
            },
        }),
        helper.accessor('duration_in_minutes', {
            id: 'duration_in_minutes',
            header: 'Duration',
            cell: ({ row }) => {
                const duration = row.original.duration_in_minutes;
                return duration ? `${duration} mins` : 'No Limit';
            },
        }),
        helper.accessor('available_from', {
            id: 'available_from',
            header: 'Availability',
            cell: ({ row }) => {
                const from = row.original.available_from;
                const until = row.original.available_until;
                if (!from || !until) return <span className="text-gray-500">Always Available</span>;
                return `${format(parseISO(from), 'dd MMM yy')} - ${format(parseISO(until), 'dd MMM yy')}`;
            },
        }),
        helper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => router.visit(route('master.test.show', { id: row.original.id }))}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Manage Questions</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => handleDetail(row.original.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={() => setIdToDelete(row.original.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ];

    return (
        <div>
            <Dialog open={idToDelete !== null} onOpenChange={(open) => !open && setIdToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Test</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this test? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIdToDelete(null)}>
                            Cancel
                        </Button>
                        <form onSubmit={onDelete} className="w-full sm:w-auto">
                            <Button variant="destructive" type="submit" className="w-full">
                                Delete
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-medium">
                        {isDetail ? (selectedTest ? `Edit Test: ${selectedTest.title}` : 'Create New Test') : 'Manage Tests'}
                    </h1>
                    <p className="text-sm text-gray-500">{isDetail ? 'Fill in the details below.' : 'View and manage all tests.'}</p>
                </div>
                {isDetail ? (
                    <Button variant="outline" onClick={() => setIsDetail(false)}>
                        Back to List
                    </Button>
                ) : (
                    <Button variant="blue" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Add Test
                    </Button>
                )}
            </div>

            <div className="my-4">
                {isDetail ? (
                    <TestForm test={selectedTest || undefined} courses={courses} />
                ) : (
                    <NextTable<Test> load={load} columns={columns} id="id" />
                )}
            </div>
        </div>
    );
}

TestIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
