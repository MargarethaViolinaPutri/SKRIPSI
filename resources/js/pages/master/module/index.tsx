import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Base } from '@/types/base';
import { Module } from '@/types/module';
import { Link, useForm } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Plus, Trash } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useState } from 'react';
import ModuleForm from './form';
export default function ModuleIndex() {
    const { processing, delete: destroy } = useForm();
    const [id, setId] = useState<any>(null);
    const [isDetail, setIsDetail] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Module[]>>(route('master.module.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<Module>();

    const onDelete = (e: FormEvent, id: any) => {
        e.preventDefault();
        destroy(route('master.module.destroy', { id: id }));
    };

    const handleDelete = useCallback((moduleId: any) => {
        setId(moduleId);
    }, []);

    const handleDetail = async (moduleId: any) => {
        try {
            const response = await axios.get(route('master.module.show', { id: moduleId }));
            console.log('Module detail response:', response);

            let moduleData = null;
            if (response.data.module) {
                moduleData = response.data.module;
            } else if (response.data.props && response.data.props.module) {
                moduleData = response.data.props.module;
            } else if (response.data) {
                moduleData = response.data;
            }

            // Normalize materials array
            if (moduleData.material_paths && moduleData.material_paths.length > 0) {
                moduleData.materials = moduleData.material_paths.map((path: string) => {
                    let url = path;
                    if (!path.startsWith('http')) {
                        if (path.startsWith('/')) {
                            url = window.location.origin + '/storage' + path;
                        } else {
                            url = window.location.origin + '/storage/' + path;
                        }
                    }
                    return {
                        url,
                        file_name: path.split('/').pop(),
                    };
                });
            }

            // Normalize course object if only course_id is present
            if (moduleData.course_id && !moduleData.course) {
                moduleData.course = { id: moduleData.course_id, name: '' };
            }

            setSelectedModule(moduleData);
            setIsDetail(true);
        } catch (error) {
            console.error('Failed to load module detail:', error);
        }
    };

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
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                            <DropdownMenuItem onClick={() => handleDetail(row.original.id)}>
                                <Eye /> Detail
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
                        <DialogTitle>Delete Module</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this module? This action cannot be undone.</DialogDescription>
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
                    <h1 className="text-lg font-medium">Module</h1>
                    <p className="text-sm">Manage All System Module</p>
                </div>
                {!isDetail && (
                    <div className="flex flex-row gap-2">
                        <Link href={route('master.module.create')}>
                            <Button variant="blue">
                                <Plus />
                                Add Data
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="my-4">
                {!isDetail ? (
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
                ) : (
                    <div>
                        {selectedModule && (
                            <ModuleForm
                                module={selectedModule}
                                isDetail={isDetail}
                                iframeSrc={selectedModule.materials && selectedModule.materials.length > 0 ? selectedModule.materials[0].url : ''}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

ModuleIndex.layout = (page: ReactNode) => <AppLayout children={page} />;
