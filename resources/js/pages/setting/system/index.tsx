import NextTable from '@/components/next-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Base, FilterProps } from '@/types/base';
import { Setting } from '@/types/setting';
import { Link, useForm } from '@inertiajs/react';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Eye, Filter, Pencil, Plus, Trash } from 'lucide-react';

const FilterComponent = ({ updateParams, currentParams }: FilterProps) => {
    const { data, setData } = useForm<any>(currentParams);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Filter /> Filter
                </Button>
            </DialogTrigger>
            <DialogContent className="w-80 sm:w-full sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Filter Data</DialogTitle>
                    <DialogDescription>Filter System Setting</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 flex flex-col space-y-2">
                        <Label>Key</Label>
                        <Input value={data['filter[key]']} onChange={(e) => setData('filter[key]', e.target.value)} placeholder="Filter By Key" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => updateParams(data)}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function SystemIndex() {
    const load = async (params: Record<string, unknown>) => {
        const response = await axios.get<Base<Setting[]>>(route('setting.system.fetch', params));
        return response.data;
    };

    const helper = createColumnHelper<Setting>();

    const columns: ColumnDef<Setting, any>[] = [
        helper.accessor('id', {
            id: 'id',
            header: 'ID',
            enableColumnFilter: false,
            enableHiding: false,
        }),
        helper.accessor('key', {
            id: 'key',
            header: 'Key',
            enableColumnFilter: true,
            cell: ({ row }) => row.original.key,
        }),
        helper.display({
            id: 'value',
            header: 'Value',
            enableColumnFilter: false,
            cell: ({ row }) => row.original.value,
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
                    <h1 className="text-lg font-medium">System Setting</h1>
                    <p className="text-sm">Manage All System Setting</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Link href={route('setting.system.create')}>
                        <Button>
                            <Plus />
                            Add Data
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="my-4">
                <NextTable<Setting>
                    enableSelect={true}
                    load={load}
                    id={'id'}
                    columns={columns}
                    mode="table"
                    filterComponent={<FilterComponent />}
                    onSelect={(val) => {
                        console.log(val);
                    }}
                />
            </div>
        </div>
    );
}

SystemIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />;
