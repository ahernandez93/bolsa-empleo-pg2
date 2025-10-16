"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { arrayIncludes } from "@/helpers/filters"

export type EmpleadoConDatos = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  departamentoId: number
  departamentodescripcion: string
  cargoId: number
  cargodescripcion: string
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
          className="data-[state=open]:bg-accent -ml-3 h-8"
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
          className="data-[state=open]:bg-accent -ml-3 h-8"
        >
          Correo
          <SortIcon sort={sort} />
        </Button>
      )
    },
  },
  {
    accessorKey: "departamentodescripcion",
    header: "Departamento",
    filterFn: arrayIncludes,
  },
  {
    accessorKey: "cargodescripcion",
    header: "Cargo",
    filterFn: arrayIncludes,
  },
  {
    accessorKey: "rol",
    header: "Rol",
    filterFn: arrayIncludes,
  },
  {
    id: "activo",
    accessorFn: (row) => String(row.activo),
    header: "Estado",
    filterFn: arrayIncludes,
    cell: ({ row }) => {
      const isActive = (row.original as EmpleadoConDatos).activo;
      return isActive
        ? <Badge variant="default">Activo</Badge>
        : <Badge variant="destructive">Inactivo</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="data-[state=open]:bg-accent -ml-3 h-8"
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
