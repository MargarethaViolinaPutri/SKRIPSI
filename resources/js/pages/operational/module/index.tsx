import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Course } from '@/types/course';
import { Module } from '@/types/module';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import NextTable from '@/components/next-table';
import axios from 'axios';

interface Props {
    course: Course;
}

export default function LMSShow({ course }: Props) {
    const loadModules = async (params: Record<string, unknown>) => {
        const queryParams = {
            ...params,
            'filter[course_id]': course.id,
        };
        
        const response = await axios.get<Base<Module[]>>(route('operational.module.fetch', queryParams));
        return response.data;
    };

    const helper = createColumnHelper<Module>();

    const moduleColumns: ColumnDef<Module, any>[] = [
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
                            <Link href={route('operational.module.show', row.original.id)}>
                                <DropdownMenuItem>
                                    <Eye /> Detail
                                </DropdownMenuItem>
                            </Link>
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
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Course: {course.name}</h1>
                <p className="text-sm text-gray-500">
                    Berikut adalah daftar modul yang tersedia untuk course ini.
                </p>
            </div>
            
            <div className="my-4">
                <h2 className="text-lg font-medium mb-2">Modules</h2>
                <NextTable<Module>
                    enableSelect={false}
                    load={loadModules}
                    id={'id'}
                    columns={moduleColumns}
                    mode="table"
                />
            </div>
        </div>
    );
}

LMSShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;