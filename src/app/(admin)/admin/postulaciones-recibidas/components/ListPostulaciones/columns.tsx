"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { EstadoSelect } from "./EstadoSelect"

export type PostulacionConDatos = {
  id: string
  perfilUsuarioNombre: string
  perfilUsuarioApellido: string
  ofertaPuesto: string
  ofertaUbicacionCiudad: string
  ofertaUbicacionDepartamento: string
  fechaPostulacion: string
  estado: "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"
}
interface GetColumnsProps {
  onEdit: (postulacion: PostulacionConDatos) => void
  onDelete: (postulacion: PostulacionConDatos) => void
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

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<PostulacionConDatos>[] => [
  {
    accessorKey: "perfilUsuarioNombre",
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
      <span className="font-medium">{row.original.perfilUsuarioNombre} {row.original.perfilUsuarioApellido}</span>
    ),
  },
  {
    accessorKey: "ofertaPuesto",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-0"
        >
          Puesto
          <SortIcon sort={sort} />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ofertaPuesto}</span>
    ),
  },
  {
    accessorKey: "fechaPostulacion",
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
    cell: ({ row }) => format(new Date(row.original.fechaPostulacion), "dd/MM/yyyy"),
  },
  {
    accessorKey: "ofertaUbicacionCiudad",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
          className="flex items-center gap-0"
        >
          Ubicación
          <SortIcon sort={sort} />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ofertaUbicacionCiudad} - {row.original.ofertaUbicacionDepartamento}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const p = row.original
      return (
        <EstadoSelect
          id={p.id}
          value={p.estado}
          onCommitted={(nuevo) => {
            // si necesitas reflejar en tu store/table sin re-fetch
            row.original.estado = nuevo
          }}
        />
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const postulacion = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(postulacion)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(postulacion)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
