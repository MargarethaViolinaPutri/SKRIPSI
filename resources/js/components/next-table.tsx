'use client';

import React from 'react';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnPinningState,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from '@tanstack/react-table';
import { Eye, MoreHorizontal, PinIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Base } from '@/types/base';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';
import { GridSkeleton } from './grid-skeleton';

type NextTableProps<T> = {
    load: (params: Record<string, unknown>) => Promise<Base<T[]>>;
    id: keyof T;
    onSelect?: (selected: unknown[]) => void;
    enableSelect?: boolean;
    columns: ColumnDef<T>[];
    filterComponent?: ReactNode;
    onParamsChange?: (params: Record<string, unknown>) => void;
    mode?: 'table' | 'grid';
    gridRenderer?: (row: T) => ReactNode;
};

function NextTable<T>({
    load,
    id,
    onSelect,
    enableSelect = false,
    columns,
    filterComponent,
    onParamsChange,
    mode = 'table',
    gridRenderer,
}: NextTableProps<T>) {
    const [data, setData] = useState<Base<T[]>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [customParams, setCustomParams] = useState<Record<string, unknown>>({});
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
        left: [],
        right: [],
    });

    const [editedRows, setEditedRows] = useState({});

    const select: ColumnDef<T> = {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="ml-1"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="ml-1"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    };

    const tableColumns = enableSelect ? [select, ...columns] : columns;

    const enhanced: ColumnDef<T>[] = tableColumns.map((column) => {
        const header = column.header?.toString() ?? column.id;
        if (column.id == 'select') return column;
        return {
            id: column.id ?? '',
            ...column,
            meta: {
                label: header,
            },
            header: ({ column }) => {
                const isPinned = column.getIsPinned() !== false;
                const canPin = column.columnDef.enablePinning !== false;
                return (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isPinned && <PinIcon className="text-muted-foreground h-3 w-3" />}
                            <span className="font-medium">{header}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {column.getCanSort() && (
                                    <>
                                        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>Sort Ascending</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>Sort Descending</DropdownMenuItem>
                                    </>
                                )}

                                {/* Add pin/unpin options only if column can be pinned */}
                                {canPin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {isPinned ? (
                                            <DropdownMenuItem onClick={() => column.pin(false)}>Unpin Column</DropdownMenuItem>
                                        ) : (
                                            <>
                                                <DropdownMenuItem onClick={() => column.pin('left')}>Pin to Left</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => column.pin('right')}>Pin to Right</DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}

                                {column.getCanHide() && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>Hide Column</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        };
    });

    // Convert filters from columnFilters to API format
    const getFiltersForApi = useCallback(() => {
        return columnFilters.reduce(
            (acc, filter) => {
                acc[filter.id] = filter.value;
                return acc;
            },
            {} as Record<string, unknown>,
        );
    }, [columnFilters]);

    // Convert sorting from SortingState to API format
    const getSortingForApi = useCallback(() => {
        const sorts = sorting
            .map((sort) => {
                return sort.desc ? `-${sort.id}` : sort.id;
            })
            .join(',');

        return {
            sort: sorts,
        };
    }, [sorting]);

    // Update params when customParams change
    useEffect(() => {
        if (onParamsChange) {
            const params = {
                page: pagination.pageIndex + 1,
                perPage: pagination.pageSize,
                ...getFiltersForApi(),
                ...getSortingForApi(),
                ...customParams,
            };
            onParamsChange(params);
        }
    }, [pagination, getFiltersForApi, getSortingForApi, customParams, onParamsChange]);

    // Fetch data with useCallback to avoid re-creation on every render
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.pageIndex + 1,
                perPage: pagination.pageSize,
                ...getFiltersForApi(),
                ...getSortingForApi(),
                ...customParams, // Include custom params in the API call
            };

            const result = await load(params);
            setData(result);
            setPagination({
                pageIndex: result.current_page ? result.current_page - 1 : 0,
                pageSize: pagination.pageSize,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : JSON.stringify(err));
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, getFiltersForApi, getSortingForApi, customParams, load]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (onSelect && enableSelect) {
            const selectedRows = Object.keys(rowSelection).map((index) => {
                const row = data.items?.[Number.parseInt(index)];
                return row?.[id];
            });
            onSelect(selectedRows);
        }
    }, [rowSelection, data, onSelect, enableSelect, id]);

    const updateCustomParams = useCallback((newParams: Record<string, unknown>) => {
        setCustomParams((prev) => ({ ...prev, ...newParams }));
    }, []);

    const table = useReactTable({
        data: data.items || [],
        columns: enhanced,
        pageCount: data.total_page ?? 1,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
            columnVisibility,
            columnPinning,
        },
        enableRowSelection: enableSelect,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnPinningChange: setColumnPinning,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        manualExpanding: true,
        manualGrouping: true,
        meta: {
            editedRows,
            setEditedRows,
        },
    });

    useEffect(() => {
        if (mode === 'grid' && !gridRenderer) {
            console.warn('Grid mode is enabled but no gridRenderer function was provided');
        }
    }, [mode, gridRenderer]);

    const ColumnToggle = () => {
        const hideable = table.getAllColumns().filter((column) => column.id != 'select');
        if (hideable.length === 0) return null;
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex h-8 items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>Column</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-2" align="end">
                    <div className="space-y-2">
                        <h4 className="mb-2 font-medium">Toggle Columns</h4>
                        <div className="space-y-2">
                            {table.getAllColumns().map((column) => {
                                return (
                                    <div key={column.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`column-${column.id}`}
                                            disabled={!column.getCanHide()}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        />
                                        <label
                                            htmlFor={`column-${column.id}`}
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {column.columnDef.meta?.label}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <div className="space-y-4">
            {!loading && (
                <div className="flex items-center space-x-2">
                    <ColumnToggle />
                    {filterComponent && (
                        <div className="flex items-center">
                            {React.isValidElement(filterComponent)
                                ? React.cloneElement(filterComponent as React.ReactElement<Record<string, unknown>>, {
                                      updateParams: updateCustomParams,
                                      currentParams: customParams,
                                  })
                                : filterComponent}
                        </div>
                    )}
                </div>
            )}

            {error && <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">Error: {error}</div>}

            {loading &&
                (mode === 'table' ? (
                    <DataTableSkeleton columnCount={columns.length} rowCount={10} />
                ) : (
                    <GridSkeleton itemCount={pagination.pageSize} />
                ))}

            {!loading && mode === 'table' && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isPinned = header.column.getIsPinned();
                                        const pinStyle = isPinned
                                            ? ({
                                                  position: 'sticky',
                                                  left: isPinned === 'left' ? 0 : undefined,
                                                  right: isPinned === 'right' ? 0 : undefined,
                                                  backgroundColor: 'var(--background)',
                                                  zIndex: 1,
                                              } satisfies React.CSSProperties)
                                            : {};

                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={isPinned ? pinStyle : {}}
                                                className={isPinned ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}
                                            >
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined} className="hover:bg-muted/50">
                                        {row.getVisibleCells().map((cell) => {
                                            // Add special styling for pinned columns
                                            const isPinned = cell.column.getIsPinned();
                                            const pinStyle = isPinned
                                                ? ({
                                                      position: 'sticky',
                                                      left: isPinned === 'left' ? 0 : undefined,
                                                      right: isPinned === 'right' ? 0 : undefined,
                                                      backgroundColor: 'var(--background)',
                                                      zIndex: 1,
                                                  } satisfies React.CSSProperties)
                                                : {};

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    style={isPinned ? pinStyle : undefined}
                                                    className={isPinned ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {!loading && mode === 'grid' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {data.items && data.items.length > 0 ? (
                        data.items.map((row, index) => (
                            <div
                                key={`grid-item-${index}`}
                                className={cn('overflow-hidden rounded-md border', enableSelect && rowSelection[index] && 'ring-primary ring-2')}
                                onClick={() => {
                                    if (enableSelect) {
                                        setRowSelection((prev) => ({
                                            ...prev,
                                            [index]: !prev[index],
                                        }));
                                    }
                                }}
                            >
                                {gridRenderer ? (
                                    gridRenderer(row)
                                ) : (
                                    <div className="p-4">
                                        <p className="text-muted-foreground text-sm">No grid renderer provided</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-md border p-8 text-center">No results found.</div>
                    )}
                </div>
            )}

            <DataTablePagination table={table} />
        </div>
    );
}

export default NextTable;
