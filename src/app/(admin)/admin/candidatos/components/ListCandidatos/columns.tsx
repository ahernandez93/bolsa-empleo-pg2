"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { arrayIncludes } from "@/helpers/filters"

export type CandidatoConDatos = {
  id: string
  nombre: string
  apellido: string
  email: string
  direccion: string | null
  telefono: string | null
  ubicacionDepartamento: string | undefined
  ubicacionCiudad: string | undefined
  createdAt: string
}
interface GetColumnsProps {
  onDelete: (candidato: CandidatoConDatos) => void
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

export const getColumns = ({ onDelete }: GetColumnsProps): ColumnDef<CandidatoConDatos>[] => [
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
    id: "ubicacion",
    accessorFn: (row: CandidatoConDatos) => {
      const d = row.ubicacionDepartamento ?? ""
      const c = row.ubicacionCiudad ?? ""
      const combo = `${d}${d && c ? " - " : ""}${c}`
      return combo.trim()
    },
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
          className="data-[state=open]:bg-accent -ml-3 h-8"
        >
          Ubicación
          <SortIcon sort={sort} />
        </Button>
      )
    },
    filterFn: arrayIncludes,
    cell: ({ row }) => {
      const ubicacionDepartamento = row.original.ubicacionDepartamento
      const ubicacionCiudad = row.original.ubicacionCiudad
      return (
        <span className="font-medium">
          {ubicacionDepartamento} , {ubicacionCiudad}
        </span>
      )
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
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
      const candidato = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(candidato)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
