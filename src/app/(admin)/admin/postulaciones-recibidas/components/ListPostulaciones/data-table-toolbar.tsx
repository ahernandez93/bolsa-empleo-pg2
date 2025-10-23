"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, MapPin, Briefcase, ClipboardList, CalendarClock, ClipboardCheck, UserCheck, XCircle } from "lucide-react"
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
                const v = String(r.getValue(columnId) ?? "").trim()
                if (v) values.add(v)
            })
            return Array.from(values)
                .sort((a, b) => a.localeCompare(b))
                .map((v) => ({ value: v, label: v, icon: Icon }))
        },
        [table]
    )

    const puestoOptions = useMemo(() => makeFacetOptions("ofertaPuesto", Briefcase), [makeFacetOptions])

    const ubicacionOptions = useMemo(() => makeFacetOptions("ubicacion", MapPin), [makeFacetOptions])

    const estadoOptions = useMemo(
        () => [
            { value: "SOLICITUD", label: "Solicitud", icon: ClipboardList },
            { value: "ENTREVISTA", label: "Entrevista", icon: CalendarClock },
            { value: "EVALUACIONES", label: "Evaluaciones", icon: ClipboardCheck },
            { value: "CONTRATACION", label: "Contratación", icon: UserCheck },
            { value: "RECHAZADA", label: "Rechazada", icon: XCircle },
        ],
        []
    )

    return (
        <div className="flex items-center gap-4 py-4">
            <Input
                placeholder="Buscar en cualquier columna..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-xs"
            />

            <DataTableFacetedFilter
                column={table.getColumn("ofertaPuesto")}
                title="Puesto"
                options={puestoOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("ubicacion")}
                title="Ubicación"
                options={ubicacionOptions}
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
