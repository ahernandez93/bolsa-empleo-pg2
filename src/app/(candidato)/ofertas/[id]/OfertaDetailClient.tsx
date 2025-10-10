// app/ofertas/[id]/OfertaDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building, Building2, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type OfertaDetail = {
    id: string;
    puesto: string;
    descripcionPuesto: string;
    empresa: string;
    modalidad: string;
    tipoTrabajo: string;
    ubicacionCiudadDescripcion?: string | null;
    ubicacionDepartamentoDescripcion?: string | null;
    fechaCreacion?: string; // ISO
};

export default function OfertaDetailClient({ id }: { id: string }) {
    const [data, setData] = useState<OfertaDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                const res = await axios.get<OfertaDetail>(`/api/ofertaslaborales/${id}`, {
                    // evita caches agresivos del navegador si te estorban
                    headers: { "Cache-Control": "no-cache" },
                });
                if (mounted) setData(res.data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    toast.error("La oferta no existe o fue removida.");
                } else {
                    toast.error("No se pudo cargar la oferta.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        run();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-6 text-slate-600">
                No se encontró la oferta.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{data.puesto}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                            <Building className="h-4 w-4" /> {data.empresa}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {data.ubicacionCiudadDescripcion} - {data.ubicacionDepartamentoDescripcion}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-4 w-4" /> {data.tipoTrabajo}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="inline-flex items-center gap-1">
                            <Building2 className="h-4 w-4" /> {data.modalidad}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="prose prose-slate max-w-none dark:prose-invert">
                    {/* Si la descripción viene en texto plano */}
                    <p className="whitespace-pre-wrap">{data.descripcionPuesto}</p>

                    {/* Si en futuro la descripción viniera en HTML confiable:
             <div dangerouslySetInnerHTML={{ __html: data.descripcionPuesto }} />
          */}
                </CardContent>
            </Card>
        </div>
    );
}
