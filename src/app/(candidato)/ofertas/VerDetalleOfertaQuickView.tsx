// components/ofertas/VerDetalleOfertaQuickView.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, MapPin, Building2, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import DOMPurify from "dompurify";

type OfertaDetail = {
    id: string;
    puesto: string;
    descripcionPuesto: string;
    empresa: string; // ← API normalizada a string
    modalidad: string;
    tipoTrabajo: string;
    ubicacionCiudadDescripcion?: string | null;
    ubicacionDepartamentoDescripcion?: string | null;
    fechaCreacion?: string; // ISO
};

export function VerDetalleOfertaQuickView({ ofertaId }: { ofertaId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<OfertaDetail | null>(null);

    // Carga on-demand al abrir
    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get<OfertaDetail>(`/api/ofertaslaborales/${ofertaId}`, {
                    headers: { "Cache-Control": "no-cache" },
                });
                if (mounted) setData(res.data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                if (mounted) {
                    setData(null);
                    if (err?.response?.status === 404) {
                        toast.error("La oferta no existe o fue removida.");
                    } else {
                        toast.error("No se pudo cargar la oferta.");
                    }
                    // Cierra si falla para evitar drawer vacío
                    setOpen(false);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (open && !data) {
            fetchData();
        }
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, ofertaId]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                </Button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-full p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
            >
                {/* Header fijo */}
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    <div className="px-5 py-4">
                        {loading || !data ? (
                            <>
                                <VisuallyHidden>
                                    <SheetTitle>Cargando oferta</SheetTitle>
                                </VisuallyHidden>
                                <Skeleton className="h-7 w-3/4" />
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-5 w-16" />
                                </div>
                            </>
                        ) : (
                            <>
                                <SheetHeader className="text-left">
                                    <SheetTitle className="text-xl">{data.puesto}</SheetTitle>
                                    <SheetDescription asChild>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                {data.empresa}
                                            </span>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {data.ubicacionCiudadDescripcion}{" "}
                                                {data.ubicacionDepartamentoDescripcion
                                                    ? `- ${data.ubicacionDepartamentoDescripcion}`
                                                    : ""}
                                            </span>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="inline-flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {data.tipoTrabajo}
                                            </span>
                                            <Badge variant="secondary">{data.modalidad}</Badge>
                                        </div>
                                    </SheetDescription>
                                </SheetHeader>
                            </>
                        )}
                    </div>
                </div>

                {/* Contenido scrollable */}
                <div className="max-h-[100dvh] overflow-y-auto px-5 py-4">
                    {loading || !data ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : (
                        <div
                            className="prose prose-slate max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.descripcionPuesto || "") }}
                        />
                    )}
                </div>

                {/* Footer con cerrar (si querés, acá podrías poner “Aplicar ahora”) */}
                <SheetFooter className="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 py-3">
                    <div className="flex w-full items-center justify-end gap-2">
                        <SheetClose asChild>
                            <Button variant="secondary">Cerrar</Button>
                        </SheetClose>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
