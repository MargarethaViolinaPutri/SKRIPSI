import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Course } from '@/types/course';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye } from 'lucide-react';

export default function LMSIndex() {
    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Course[]>>(route('master.course.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<Course>();

    const columns: ColumnDef<Course, any>[] = [
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
                    <div className="flex">
                        <Link href={route('operational.lms.show', row.original.id)}>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="transition-all duration-200 ease-in-out hover:bg-primary hover:text-white hover:-translate-y-1 hover:scale-105"
                            >
                                {/* <Terminal className="mr-2 h-4 w-4" /> */}
                                Detail
                            </Button>
                        </Link>
                    </div>
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
                    <h1 className="text-lg font-medium">LMS Course</h1>
                    <p className="text-sm">List available LMS Course</p>
                </div>
            </div>
            <div className="my-4">
                <NextTable<Course>
                    enableSelect={false}
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

LMSIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;
