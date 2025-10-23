"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, MapPin } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { useState, useEffect, useCallback, useMemo } from "react"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState<string>("")

    useEffect(() => {
        const timer = setTimeout(() => {
            table.setGlobalFilter(globalFilter || undefined)
        }, 300)
        return () => clearTimeout(timer)
    }, [globalFilter, table])

    const isFiltered = table.getState().columnFilters.length > 0

    const makeFacetOptions = useCallback(
        (columnId: string, Icon: React.ElementType) => {
            const values = new Set<string>()
            table.getPreFilteredRowModel().flatRows.forEach((r) => {
                const v = String(r.getValue(columnId) ?? "")
                if (v.trim()) values.add(v.trim())
            })
            return Array.from(values)
                .sort((a, b) => a.localeCompare(b))
                .map((v) => ({ label: v, value: v, icon: Icon }))
        },
        [table]
    )

    const ubicacionOptions = useMemo(() => makeFacetOptions("ubicacion", MapPin), [makeFacetOptions])

    return (
        <div className="flex items-center gap-4 py-4">
            <Input
                placeholder="Buscar en cualquier columna..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-xs"
            />

            <DataTableFacetedFilter
                column={table.getColumn("ubicacion")}
                title="Ubicación"
                options={ubicacionOptions}
            />

            {isFiltered && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        table.resetColumnFilters()
                        setGlobalFilter("")
                    }}
                    className="h-8 px-2"
                >
                    Limpiar filtros
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
