"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

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

    return (
        <div className="flex items-center gap-4 py-4">
            <Input
                placeholder="Buscar en cualquier columna..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-xs"
            />

            <Label htmlFor="departamento">Departamento</Label>

            <Select
                onValueChange={(value) =>
                    table.getColumn("departamento")?.setFilterValue(value === "all" ? "" : value)
                }
                defaultValue="all"
            >
                <SelectTrigger className="w-[150px]">
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
