"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"

export type EmpleadoConDatos = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  departamento: string
  cargo: string
  activo: boolean
  createdAt: string
}
interface GetColumnsProps {
  onEdit: (empleado: EmpleadoConDatos) => void
  onDelete: (empleado: EmpleadoConDatos) => void
}

const SortIcon = ({ sort }: { sort: "asc" | "desc" | false }) => {
  return (
    <span className="flex flex-col ml-1">
      <ArrowUp
        className={`w-3 h-3 ${sort === "asc" ? "text-blue-600" : "text-gray-300"}`}
      />
      <ArrowDown
        className={`w-3 h-3 -mt-3 ${sort === "desc" ? "text-blue-600" : "text-gray-300"}`}
      />
    </span>
  )
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<EmpleadoConDatos>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
          className="flex items-center gap-0"
        >
          Nombre
          <SortIcon sort={sort} />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.nombre} {row.original.apellido}</span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-0"
        >
          Correo
          <SortIcon sort={sort} />
        </Button>
      )
    },
  },
  {
    accessorKey: "rol",
    header: "Rol",
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => (
      row.original.activo
        ? <Badge variant="default">Activo</Badge>
        : <Badge variant="destructive">Inactivo</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-0"
        >
          Creado
          <SortIcon sort={sort} />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const empleado = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(empleado)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(empleado)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
