"use client";

import React, { useEffect, useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types";
import {formatAmount} from "@/lib/utils";

export const columns: ColumnDef<Transaction>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // {
    //     accessorKey: "creditorName",
    //     id: "Creditor Name",
    //     header: "Creditor Name",
    // },
    // Change onClick handler for sorting to use the correct accessor key
    {
        accessorKey: "Payee",
        id: "Payee",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    // Pass the accessor key as the third argument to toggleSorting

                >
                    Payee
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },

    {
        accessorKey: "transactionAmount.amount",
        header: "Amount",
        cell: ({row}) => {
            const amount = row.original.transactionAmount.amount;
            const currency = row.original.transactionAmount.currency;

            const displayAmount = formatAmount(amount, currency);
            return (
                <div className={`flex flex-col font-medium ${amount[0] === '-' ? 'text-[#f04438]'
                    : 'text-[#039855]'}`} style={{ whiteSpace: 'nowrap' }}>
                    {displayAmount}
                </div>
            );
        },
    },
    // {
    //     accessorKey: "transactionAmount.currency",
    //     header: "Currency",
    //     // cell: ({ row }) => (
    //     //     <div className="text-left">
    //     //         {row.getValue("transactionAmount.currency")}
    //     //     </div>
    //     // ),
    // },
    {
        accessorKey: "bookingDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-left"
                >
                    Payment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        // Center cell content
        cell: ({ row }) => {
            const bookingDate = new Date(row.getValue("bookingDate"));
            const formattedDate = bookingDate.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            return (
                <div className="px-6 text-left">
                    {formattedDate}
                </div>
            );
        }

    },
    {
        accessorKey: "Bank",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="text-left px--5"
                >
                    Bank
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }
    },
    {
        accessorKey: "remittanceInformationUnstructuredArray",
        header: "Description",
        cell: ({ row }) => {
            const remittanceInformation = row.getValue("remittanceInformationUnstructuredArray") as string[];
            return (
                <div className="flex flex-col justify-center" style={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                    {remittanceInformation.map((item, index) => (
                        <div key={index}>{item}</div>
                    ))}
                </div>
            );
        },
    }
];
// Define a constant key for storing data in browser storage
const STORAGE_KEY = "transactionsData";

export function TransactionsTable() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    useEffect(() => {
        // Check if data exists in browser storage
        //const storedData = sessionStorage.getItem(STORAGE_KEY);
        const storedData = null;
        if (storedData) {
            // If data exists, parse and set it as transactions
            setTransactions(JSON.parse(storedData));
            setLoading(false);
        } else {
            // If no data in storage, fetch from API
            const fetchTransactions = async () => {
                try {
                    const response = await fetch("/api/transactions");
                    const data: Transaction[] = await response.json();
                    // Set transactions state
                    setTransactions(data);
                    // Store data in browser storage
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchTransactions();
        }
    }, []); // Empty dependency array ensures this effect runs only once on component mount


    const table = useReactTable({
        data: transactions,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            //sorting: [{id: 'bookingDate', desc:true}], causes some pagination error
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });


    if (loading) {
        return <p>Loading...</p>;
    }

    const console_data = sessionStorage.getItem(STORAGE_KEY);
    console.log(transactions);

    return (
        // Ensure there is no vertical overflow
        <div className="overflow-hidden w-full">
            <div className="flex items-center py-4 px-1">
                <Input
                    placeholder="Filter creditor names..."
                    value={(table.getColumn("Payee")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("Payee")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />



                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-y-hidden max-h-[600px]">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className={"custom-header-row"}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
