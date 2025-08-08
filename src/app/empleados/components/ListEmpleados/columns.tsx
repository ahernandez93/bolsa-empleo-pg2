"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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

export const columns: ColumnDef<EmpleadoConDatos>[] = [
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
]
