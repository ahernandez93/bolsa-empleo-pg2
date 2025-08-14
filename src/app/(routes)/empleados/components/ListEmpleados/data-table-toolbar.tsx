"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Table } from "@tanstack/react-table"
// import { EmpleadoConDatos } from "./columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center gap-4 py-4">
            <Input
                placeholder="Buscar por nombre o correo..."
                value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
                onChange={(event) => {
                    const value = event.target.value
                    table.getColumn("nombre")?.setFilterValue(value)
                    table.getColumn("email")?.setFilterValue(value)
                }}
                className="max-w-sm"
            />

            <Select
                onValueChange={(value) =>
                    table.getColumn("departamento")?.setFilterValue(value === "all" ? "" : value)
                }
                defaultValue="all"
            >
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por departamento" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ventas">Ventas</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Administración">Administración</SelectItem>
                </SelectContent>
            </Select>

            {isFiltered && (
                <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2">
                    Limpiar filtros
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
