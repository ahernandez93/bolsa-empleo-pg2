"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { EstadoSelect } from "./EstadoSelect"
import { arrayIncludes } from "@/helpers/filters"


const ESTADO_LABELS: Record<PostulacionConDatos["estado"], string> = {
  SOLICITUD: "Solicitud",
  ENTREVISTA: "Entrevista",
  EVALUACIONES: "Evaluaciones",
  CONTRATACION: "Contratacion",
  RECHAZADA: "Rechazada",
}


export type PostulacionConDatos = {
  id: string
  perfilUsuarioNombre: string
  perfilUsuarioApellido: string
  ofertaPuesto: string
  ofertaUbicacionCiudad: string | undefined
  ofertaUbicacionDepartamento: string | undefined
  fechaPostulacion: string
  estado: "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"
  ultimoCambioEstado?: "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"
  ultimoCambioFecha?: string
  ultimoCambioNotas?: string | null
}

interface GetColumnsProps {
  onEdit: (postulacion: PostulacionConDatos) => void
  onDelete: (postulacion: PostulacionConDatos) => void
  onOpenSheet: (postulacionId: string) => void
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

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}


export const getColumns = ({ onEdit, onDelete, onOpenSheet }: GetColumnsProps): ColumnDef<PostulacionConDatos>[] => [
  {
    accessorKey: "perfilUsuarioNombre",
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
    cell: ({ row }) => {
      const fullName = `${row.original.perfilUsuarioNombre} ${row.original.perfilUsuarioApellido}`
      return (
        <Button
          variant="link"
          className="p-0 h-auto font-semibold"
          onClick={() => onOpenSheet(row.original.id)} //id = postulacionId
        >
          {fullName}
        </Button>
      )
    },
  },
  {
    accessorKey: "ofertaPuesto",
    header: ({ column }) => {
      const sort = column.getIsSorted() ?? false
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="data-[state=open]:bg-accent -ml-3 h-8"
        >
          Puesto
          <SortIcon sort={sort} />
        </Button>
      )
    },
    filterFn: arrayIncludes,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ofertaPuesto}</span>
    ),
  },
  {
    id: "ubicacion",
    accessorFn: (row) => {
      const c = row.ofertaUbicacionCiudad ?? ""
      const d = row.ofertaUbicacionDepartamento ?? ""
      const combo = `${c}${c && d ? " - " : ""}${d}`.trim()
      return combo
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
      <span className="font-medium">{row.original.ofertaUbicacionCiudad} - {row.original.ofertaUbicacionDepartamento}</span>
    ),
  },
  {
    accessorKey: "estado",
    header: "Estado",
    filterFn: arrayIncludes,
    cell: ({ row }) => {
      const p = row.original
      return (
        <EstadoSelect
          id={p.id}
          value={p.estado}
          onCommitted={(nuevo) => {
            row.original.estado = nuevo
          }}
        />
      )
    },
  },
  {
    accessorKey: "fechaPostulacion",
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
    cell: ({ row }) => format(new Date(row.original.fechaPostulacion), "dd/MM/yyyy"),
  },
  {
    id: "ultimoCambio",
    header: "Ultimo cambio",
    cell: ({ row }) => {
      const estado = row.original.ultimoCambioEstado ?? row.original.estado
      const fecha = row.original.ultimoCambioFecha
      if (!fecha) return "—"
      return (
        <div className="space-y-1">
          <div className="text-sm font-semibold">{ESTADO_LABELS[estado]}</div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(fecha), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
      )
    },
  },
  {
    id: "ultimoCambioNotas",
    header: "Notas",
    cell: ({ row }) => {
      const notas = row.original.ultimoCambioNotas
      if (!notas) return "—"
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm text-muted-foreground cursor-default">
              {truncateText(notas, 20)}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {notas}
          </TooltipContent>
        </Tooltip>
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
