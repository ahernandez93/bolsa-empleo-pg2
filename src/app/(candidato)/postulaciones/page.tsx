"use client";

import useSWR from "swr";
import axios from "axios";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PostulacionCard, { EstadoPostulacion } from "./components/PostulacionCard";

type PostulacionItem = {
    id: string;
    estado: EstadoPostulacion;
    fechaPostulacion: string;
    fechaActualizacion: string;
    oferta: {
        id: string;
        puesto: string;
        empresa: { nombre: string };
        modalidad: string;
        tipoTrabajo: string;
        ubicacionCiudad: { nombre: string };
        ubicacionDepartamento: { nombre: string };
    };
};

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function PanelPostulaciones() {
    const { data, error, isLoading, mutate } = useSWR<{ postulaciones: PostulacionItem[] }>(
        "/api/postulaciones/mias",
        fetcher,
        { revalidateOnFocus: true }
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const postulaciones = useMemo(() => data?.postulaciones ?? [], [data]);

    /* const onWithdraw = (id: string) => {
        setSelectedId(id);
        setConfirmOpen(true);
    }; */

    const confirmWithdraw = async () => {
        if (!selectedId) return;
        setLoadingAction(true);

        // Optimista: marcar RETIRADA al instante
        //const now = new Date().toISOString();
        const prev = data;

        /* mutate(
            (curr) => {
                if (!curr) return curr;
                return {
                    ...curr,
                    postulaciones: curr.postulaciones.map((p) =>
                        p.id === selectedId
                            ? { ...p, estado: "RETIRADA", fechaActualizacion: now }
                            : p
                    ),
                };
            },
            { revalidate: false }
        ); */

        try {
            await axios.patch(`/api/postulaciones/${selectedId}`, { accion: "RETIRAR" });
            toast.success("Postulación retirada");
            // Revalida en segundo plano para asegurar estado real del server
            mutate();
        } catch (err) {
            // rollback si falla
            mutate(prev, { revalidate: false });
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "No se pudo retirar");
            } else {
                toast.error("Error de red");
            }
        } finally {
            setLoadingAction(false);
            setConfirmOpen(false);
            setSelectedId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6">

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="p-4">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-4" />
                                <Skeleton className="h-20 w-full" />
                                <div className="mt-3 flex gap-2">
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">Error al cargar postulaciones</div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Postulaciones</h1>
                        <p className="text-sm text-muted-foreground">Tus postulaciones</p>
                    </div>
                    {/* Acciones globales (opcional): limpiar, exportar, etc. */}
                </div>
                {postulaciones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aún no tenés postulaciones.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {postulaciones.map((p) => (
                            <PostulacionCard
                                key={p.id}
                                id={p.id}
                                estado={p.estado}
                                fechaPostulacion={p.fechaPostulacion}
                                fechaActualizacion={p.fechaActualizacion}
                                //onWithdraw={onWithdraw}
                                oferta={{
                                    id: p.oferta.id,
                                    puesto: p.oferta.puesto,
                                    empresa: p.oferta.empresa.nombre,
                                    modalidad: p.oferta.modalidad,
                                    tipoTrabajo: p.oferta.tipoTrabajo,
                                    ubicacionCiudadNombre: p.oferta.ubicacionCiudad?.nombre ?? "",
                                    ubicacionDepartamentoNombre: p.oferta.ubicacionDepartamento?.nombre ?? "",
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Confirmar retiro */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Retirar postulación?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tu postulación será marcada como <strong>RETIRADA</strong> y el reclutador ya no la verá en proceso.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loadingAction}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmWithdraw} disabled={loadingAction}>
                                {loadingAction ? "Retirando..." : "Confirmar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
