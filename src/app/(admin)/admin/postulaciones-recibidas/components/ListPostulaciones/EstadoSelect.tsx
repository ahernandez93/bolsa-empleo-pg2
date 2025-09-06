"use client"

import axios from "axios"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useState, useEffect } from "react"

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"

const ESTADO_CONFIG: Record<Estado, { label: string; badgeClass: string; dotColor: string }> = {
    SOLICITUD: { label: "Solicitud", badgeClass: "bg-muted text-foreground", dotColor: "bg-gray-400" },
    ENTREVISTA: { label: "Entrevista", badgeClass: "bg-blue-600 text-white", dotColor: "bg-blue-600" },
    EVALUACIONES: { label: "Evaluaciones", badgeClass: "bg-yellow-500 text-white", dotColor: "bg-yellow-500" },
    CONTRATACION: { label: "Contratación", badgeClass: "bg-green-600 text-white", dotColor: "bg-green-600" },
    RECHAZADA: { label: "Rechazada", badgeClass: "bg-red-600 text-white", dotColor: "bg-red-600" },
}

async function updateEstadoAPI(id: string, estado: Estado) {
    await axios.patch(`/api/postulaciones/${id}/estado`, { estado })
}

export function EstadoSelect({
    id,
    value,
    onCommitted,
}: {
    id: string
    value: Estado
    onCommitted?: (nuevo: Estado) => void
}) {
    const [local, setLocal] = useState<Estado>(value)
    const [pending, setPending] = useState(false)

    useEffect(() => { setLocal(value) }, [value])

    const onChange = async (nuevo: Estado) => {
        if (nuevo === local) return
        const prev = local
        setLocal(nuevo)
        setPending(true)
        try {
            await updateEstadoAPI(id, nuevo)
            toast.success("Estado actualizado")
            onCommitted?.(nuevo)
        } catch (e) {
            setLocal(prev)
            console.error("Error al actualizar el estado:", e)
            toast.error("Error al actualizar el estado")
        } finally {
            setPending(false)
        }
    }

    const cfg = ESTADO_CONFIG[local]

    return (
        <Select disabled={pending} value={local} onValueChange={(v) => onChange(v as Estado)}>
            <SelectTrigger className="h-8 w-[140px]">
                <Badge className={`justify-center w-full ${cfg.badgeClass}`}>
                    {cfg.label}
                </Badge>
                <SelectValue aria-label={cfg.label} className="sr-only" />
            </SelectTrigger>
            <SelectContent>
                {(Object.keys(ESTADO_CONFIG) as Estado[]).map((key) => {
                    const c = ESTADO_CONFIG[key]
                    return (
                        <SelectItem key={key} value={key}>
                            <span className="inline-flex items-center gap-2">
                                <span className={`inline-block h-2 w-2 rounded-full ${c.dotColor}`} />
                                {c.label}
                            </span>
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
