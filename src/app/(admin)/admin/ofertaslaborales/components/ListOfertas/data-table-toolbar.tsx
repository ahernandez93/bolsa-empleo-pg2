"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { useState, useEffect, useMemo, useCallback } from "react"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Tag, MapPin, UserRound, Hourglass, Megaphone, CircleSlash2, Archive } from "lucide-react"

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

    const areaOptions = useMemo(() => makeFacetOptions("area", Tag), [makeFacetOptions])

    const ubicacionOptions = useMemo(() => makeFacetOptions("ubicacion", MapPin), [makeFacetOptions])

    const agregadoPorOptions = useMemo(
        () => makeFacetOptions("agregadoPorUsuario", UserRound),
        [makeFacetOptions]
    )

    const estadoOptions = useMemo(
        () => [
            { value: "PENDIENTE", label: "Pendiente", icon: Hourglass },
            { value: "ABIERTA", label: "Abierta", icon: Megaphone },
            { value: "RECHAZADA", label: "Rechazada", icon: CircleSlash2 },
            { value: "CERRADA", label: "Cerrada", icon: Archive },
        ],
        []
    )

    return (
        <div className="flex flex-wrap items-center gap-3 py-4">
            <Input
                placeholder="Buscar en cualquier columna..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-xs"
            />

            <DataTableFacetedFilter
                column={table.getColumn("area")}
                title="Área"
                options={areaOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("ubicacion")}
                title="Ubicación"
                options={ubicacionOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("agregadoPorUsuario")}
                title="Agregado por"
                options={agregadoPorOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("estado")}
                title="Estado"
                options={estadoOptions}
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
