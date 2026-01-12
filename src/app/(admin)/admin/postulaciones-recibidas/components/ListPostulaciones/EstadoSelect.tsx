"use client";

import axios from "axios";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA";

const ESTADO_CONFIG: Record<Estado, { label: string; badgeClass: string; dotColor: string }> = {
  SOLICITUD: { label: "Solicitud", badgeClass: "bg-muted text-foreground", dotColor: "bg-gray-400" },
  ENTREVISTA: { label: "Entrevista", badgeClass: "bg-blue-600 text-white", dotColor: "bg-blue-600" },
  EVALUACIONES: { label: "Evaluaciones", badgeClass: "bg-yellow-500 text-white", dotColor: "bg-yellow-500" },
  CONTRATACION: { label: "Contratación", badgeClass: "bg-green-600 text-white", dotColor: "bg-green-600" },
  RECHAZADA: { label: "Rechazada", badgeClass: "bg-red-600 text-white", dotColor: "bg-red-600" },
};

const ORDER: Record<Exclude<Estado, "RECHAZADA">, number> = {
  SOLICITUD: 0,
  ENTREVISTA: 1,
  EVALUACIONES: 2,
  CONTRATACION: 3,
};

const ALL_ESTADOS: Estado[] = ["SOLICITUD", "ENTREVISTA", "EVALUACIONES", "CONTRATACION", "RECHAZADA"];

function isFinalEstado(estado: Estado) {
  return estado === "CONTRATACION" || estado === "RECHAZADA";
}

function isAllowedOption(current: Estado, candidate: Estado) {
  if (candidate === current) return true;
  if (isFinalEstado(current)) return false;
  if (candidate === "RECHAZADA") return true;

  const currentRank = ORDER[current as Exclude<Estado, "RECHAZADA">];
  const candidateRank = ORDER[candidate as Exclude<Estado, "RECHAZADA">];
  return candidateRank >= currentRank;
}

async function updateEstadoAPI(id: string, estado: Estado) {
  await axios.patch(`/api/postulaciones/${id}/estado`, { estado });
}

export function EstadoSelect({
  id,
  value,
  onCommitted,
}: {
  id: string;
  value: Estado;
  onCommitted?: (nuevo: Estado) => void;
}) {
  const [local, setLocal] = useState<Estado>(value);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const disabled = pending || isFinalEstado(local);

  const options = ALL_ESTADOS.filter((estado) => isAllowedOption(local, estado));

  const onChange = async (nuevo: Estado) => {
    if (nuevo === local) return;

    if (!isAllowedOption(local, nuevo)) {
      toast.error("No se permite cambiar a un estado anterior");
      return;
    }

    const prev = local;
    setLocal(nuevo);
    setPending(true);
    try {
      await updateEstadoAPI(id, nuevo);
      toast.success("Estado actualizado");
      onCommitted?.(nuevo);
    } catch (e) {
      setLocal(prev);

      const message =
        axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object"
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((e.response.data as any).message as string | undefined)
          : undefined;

      toast.error(message ?? "Error al actualizar el estado");
    } finally {
      setPending(false);
    }
  };

  const cfg = ESTADO_CONFIG[local];

  return (
    <Select disabled={disabled} value={local} onValueChange={(v) => onChange(v as Estado)}>
      <SelectTrigger className="h-8 w-[140px]">
        <Badge className={`justify-center w-full ${cfg.badgeClass}`}>{cfg.label}</Badge>
        <SelectValue aria-label={cfg.label} className="sr-only" />
      </SelectTrigger>
      <SelectContent>
        {options.map((key) => {
          const c = ESTADO_CONFIG[key];
          return (
            <SelectItem key={key} value={key}>
              <span className="inline-flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${c.dotColor}`} />
                {c.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
