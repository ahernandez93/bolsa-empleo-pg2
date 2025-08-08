"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export type EmpleadoConDatos = {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  departamento: string
  cargo: string
  activo: boolean
  createdAt: string
}
interface GetColumnsProps {
  onEdit: (empleado: EmpleadoConDatos) => void
  onDelete: (empleado: EmpleadoConDatos) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<EmpleadoConDatos>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.nombre} {row.original.apellido}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
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
    header: "Creado",
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
