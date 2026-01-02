"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Briefcase, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type EstadoPostulacion =
    | "SOLICITUD"
    | "ENTREVISTA"
    | "EVALUACIONES"
    | "CONTRATACION"
    | "RECHAZADA";

type Props = {
    id: string; // id de la postulacion
    oferta: {
        id: string;
        puesto: string;
        empresa: string;
        modalidad: string;
        tipoTrabajo: string;
        ubicacionCiudadNombre: string;
        ubicacionDepartamentoNombre: string;
    };
    estado: EstadoPostulacion;
    fechaPostulacion: string | Date;
    fechaActualizacion: string | Date;
    canWithdraw?: boolean;
};

const ESTADO_CFG: Record<
    EstadoPostulacion,
    { label: string; badgeClass: string; step: number }
> = {
    SOLICITUD: { label: "Solicitud", badgeClass: "bg-muted text-foreground", step: 1 },
    ENTREVISTA: { label: "Entrevista", badgeClass: "bg-blue-600 text-white", step: 2 },
    EVALUACIONES: { label: "Evaluaciones", badgeClass: "bg-yellow-500 text-white", step: 3 },
    CONTRATACION: { label: "Contratación", badgeClass: "bg-green-600 text-white", step: 4 },
    RECHAZADA: { label: "Rechazada", badgeClass: "bg-red-600 text-white", step: 0 },
};

function StepsBar({ step }: { step: number }) {
    const total = 4;
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => {
                const filled = step > 0 && i < step;
                return (
                    <span
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full bg-slate-200",
                            filled && "bg-emerald-500"
                        )}
                    />
                );
            })}
        </div>
    );
}

export default function PostulacionCard({
    id,
    oferta,
    estado,
    fechaPostulacion,
    fechaActualizacion,
}: Props) {
    const cfg = ESTADO_CFG[estado];

    const pubAgo = formatDistanceToNow(new Date(fechaPostulacion), {
        addSuffix: true,
        locale: es,
    });
    const updAgo = formatDistanceToNow(new Date(fechaActualizacion), {
        addSuffix: true,
        locale: es,
    });

    const isContratacion = estado === "CONTRATACION";

    return (
        <Card className="group relative overflow-hidden border-slate-200 h-full flex flex-col">
            <CardHeader className="pb-2 pr-12">
                <div className="text-sm text-muted-foreground">{oferta.empresa}</div>
                <CardTitle className="text-lg font-semibold leading-tight truncate">
                    {oferta.puesto}
                </CardTitle>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {oferta.ubicacionCiudadNombre} - {oferta.ubicacionDepartamentoNombre}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {oferta.modalidad}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {oferta.tipoTrabajo}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
                    <div className="text-xs text-slate-500">
                        Postulada {pubAgo} • Actualizada {updAgo}
                    </div>
                </div>

                {/* Progreso (no se muestra si está finalizada negativa) */}
                {cfg.step > 0 ? (
                    <div className="space-y-1">
                        <StepsBar step={cfg.step} />
                        <div className="text-[11px] text-slate-500">
                            Progreso del proceso (paso {cfg.step} de 4)
                        </div>
                    </div>
                ) : (
                    <div className="text-[11px] text-slate-500">
                        Proceso finalizado
                    </div>
                )}

                {/* ÚNICA acción: Documentación */}
                {isContratacion && (
                    <div className="mt-2">
                        <Link href={`/postulaciones/${id}/documentos`}>
                            <Button className="w-full">
                                <FileUp className="h-4 w-4 mr-2" />
                                Documentación
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
