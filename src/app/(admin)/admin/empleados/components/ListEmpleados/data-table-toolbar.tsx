"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Table } from "@tanstack/react-table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Label } from "@/components/ui/label"
import { useState, useEffect, useMemo } from "react"
import { DepartamentoItem } from "@/app/actions/departamentos-actions"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { ShieldCheck, SquareCheck, Square, Users2, IdCard } from "lucide-react"
import { CargoItem } from "@/app/actions/cargos-actions"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    departamentos: DepartamentoItem[]
    cargos: CargoItem[]
}

export function DataTableToolbar<TData>({ table, departamentos, cargos }: DataTableToolbarProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState<string>("")

    useEffect(() => {
        const timer = setTimeout(() => {
            table.setGlobalFilter(globalFilter || undefined)
        }, 300)
        return () => clearTimeout(timer)
    }, [globalFilter, table])

    const isFiltered = table.getState().columnFilters.length > 0

    const departamentoOptions = useMemo(
        () =>
            departamentos.map((d) => ({
                label: d.descripcion,
                value: String(d.descripcion),
                icon: Users2,
            })),
        [departamentos]
    )

    const cargoOptions = useMemo(
        () =>
            cargos.map((c) => ({
                label: c.descripcion,
                value: String(c.descripcion),
                icon: IdCard,
            })),
        [cargos]
    )

    const rolOptions = useMemo(
        () => [
            { value: "ADMIN", label: "Admin", icon: ShieldCheck },
            { value: "RECLUTADOR", label: "Reclutador", icon: Users2 },
        ],
        []
    )

    const estadoOptions = useMemo(
        () => [
            { value: "true", label: "Activo", icon: SquareCheck },
            { value: "false", label: "Inactivo", icon: Square },
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
            {/* <div className="flex items-center gap-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select
                    onValueChange={(value) =>
                        table.getColumn("departamentodescripcion")?.setFilterValue(value === "all" ? "" : value)
                    }
                    defaultValue="all"
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filtrar por departamento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {departamentos.map((dep) => (
                            <SelectItem
                                key={dep.id}
                                value={dep.descripcion.toString()}
                            >
                                {dep.descripcion}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

            <DataTableFacetedFilter
                column={table.getColumn("departamentodescripcion")}
                title="Departamento"
                options={departamentoOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("cargodescripcion")}
                title="Cargo"
                options={cargoOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("rol")}
                title="Rol"
                options={rolOptions}
            />

            <DataTableFacetedFilter
                column={table.getColumn("activo")}
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
