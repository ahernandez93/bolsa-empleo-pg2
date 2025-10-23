"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { arrayIncludes } from "@/helpers/filters"

export type OfertaLaboralConDatos = {
  id: string
  puesto: string
  area: string
  empresaId: string
  empresaNombre: string | undefined
  ubicacionDepartamentoId: number
  ubicacionDepartamentoDescripcion: string | undefined
  ubicacionCiudadId: number
  ubicacionCiudadDescripcion: string | undefined
  agregadoPorId: string
  agregadoPorUsuario: string
  estado: string
}
interface GetColumnsProps {
  onEdit: (ofertaLaboral: OfertaLaboralConDatos) => void
  onDelete: (ofertaLaboral: OfertaLaboralConDatos) => void
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

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<OfertaLaboralConDatos>[] => [
  {
    accessorKey: "puesto",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
          className="data-[state=open]:bg-accent -ml-3 h-8"
        >
          Puesto
          <SortIcon sort={sort} />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium">{row.original.puesto}</span>
    ),
  },
  {
    accessorKey: "area",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="data-[state=open]:bg-accent -ml-3 h-8"
        >
          Area
          <SortIcon sort={sort} />
        </Button>
      )
    },
    filterFn: arrayIncludes,
  },
  {
    accessorKey: "empresaId",
    header: "Empresa",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.empresaNombre}</span>
    ),
  },
  {
    id: "ubicacion",
    accessorFn: (row: OfertaLaboralConDatos) => {
      const d = row.ubicacionDepartamentoDescripcion ?? ""
      const c = row.ubicacionCiudadDescripcion ?? ""
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
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ubicacionDepartamentoDescripcion} - {row.original.ubicacionCiudadDescripcion}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    filterFn: arrayIncludes,
    cell: ({ row }) => {
      if (row.original.estado === "ABIERTA") {
        return <Badge variant="default">Abierta</Badge>
      } else if (row.original.estado === "RECHAZADA") {
        return <Badge variant="destructive">Rechazada</Badge>
      } else if (row.original.estado === "CERRADA") {
        return <Badge variant="secondary">Cerrada</Badge>
      } else {
        return <Badge variant="secondary">Pendiente</Badge>
      }
    },
  },
  {
    accessorKey: "agregadoPorUsuario",
    header: "Agregado por",
    filterFn: arrayIncludes,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const ofertaLaboral = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(ofertaLaboral)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(ofertaLaboral)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  },
]
