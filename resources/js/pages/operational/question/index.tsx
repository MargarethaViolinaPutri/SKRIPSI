import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Module } from '@/types/module';
import { Question } from '@/types/question';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { Eye, Terminal  } from 'lucide-react';

interface Props {
    module: Module;
}

export default function ModuleShow({ module }: Props) {
    const loadQuestions = async (params: Record<string, unknown>) => {
        const queryParams = {
            ...params,
            'filter[module_id]': module.id,
        };
        
        const response = await axios.get<Base<Question[]>>(route('operational.question.fetch', queryParams));
        return response.data;
    };

    const helper = createColumnHelper<Question>();

    const questionColumns: ColumnDef<Question, any>[] = [
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
        helper.accessor('desc', {
            id: 'desc',
            header: 'Description',
            enableColumnFilter: true,
            cell: ({ row }) => {
                const description = row.original.desc || '';

                if (description.length > 80) {
                    return `${description.substring(0, 80)}...`;
                }

                return description;
            },
        }),
        helper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                            <Link href={route('operational.module.material', { id: module.id })}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Material
                                </DropdownMenuItem>
                            </Link>

                            {/* Aksi untuk mengerjakan soal (misal: masuk ke halaman coding) */}
                            <DropdownMenuItem>
                                <Terminal className="mr-2 h-4 w-4" />Solve Question
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ];

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-gray-500">Course: {module.course?.name}</p>
                <h1 className="text-2xl font-bold">Module: {module.name}</h1>
                <p className="text-sm text-gray-500">
                    Berikut adalah daftar pertanyaan yang tersedia untuk modul ini.
                </p>
            </div>
            
            <div className="my-4">
                <h2 className="text-lg font-medium mb-2">Questions</h2>
                <NextTable<Question>
                    enableSelect={false}
                    load={loadQuestions}
                    id={'id'}
                    columns={questionColumns}
                    mode="table"
                />
            </div>
        </div>
    );
}

ModuleShow.layout = (page: React.ReactNode) => <AppLayout children={page} />;