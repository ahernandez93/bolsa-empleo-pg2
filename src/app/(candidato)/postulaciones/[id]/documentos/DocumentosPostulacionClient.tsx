"use client";

import useSWR from "swr";
import axios from "axios";
import { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadCloud, FileText, ExternalLink, Download, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DocEstado = "PENDIENTE" | "SUBIDO" | "RECHAZADO" | "APROBADO";

type DocItem = {
    documentoTipoId: string;
    codigo: string;
    nombre: string;
    requerido: boolean;
    orden: number;
    estado: DocEstado;
    url: string | null;
};

type ApiResponse = {
    meta: {
        candidato: { nombreCompleto: string };
        oferta: { puesto: string; empresa: string };
    };
    docs: DocItem[];
};

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function DocumentosPostulacionClient({ postulacionId }: { postulacionId: string }) {
    const { data, isLoading, error, mutate } = useSWR<ApiResponse>(
        `/api/postulaciones/${postulacionId}/documentos`,
        fetcher
    );

    const docs = useMemo(
        () => (data?.docs ?? []).slice().sort((a, b) => a.orden - b.orden),
        [data]
    );

    const nombreCandidato = data?.meta?.candidato?.nombreCompleto ?? "Candidato";
    const ofertaNombre = data?.meta?.oferta?.puesto ?? "";
    const empresaNombre = data?.meta?.oferta?.empresa ?? "";

    const requeridos = docs.filter(d => d.requerido);
    const reqSubidos = requeridos.filter(d => d.estado === "SUBIDO" || d.estado === "APROBADO").length;
    const progreso = requeridos.length ? Math.round((reqSubidos / requeridos.length) * 100) : 0;

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<DocItem | null>(null);
    const [uploading, setUploading] = useState(false);

    const fileRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [confirmDelOpen, setConfirmDelOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toDelete, setToDelete] = useState<DocItem | null>(null);

    const openUpload = (doc: DocItem) => {
        setActive(doc);
        setSelectedFile(null);
        setOpen(true);
    };

    const validateFile = (file: File) => {
        const okType = file.type.startsWith("image/") || file.type === "application/pdf";
        if (!okType) {
            toast.error("Solo imagen (JPG/PNG) o PDF");
            return false;
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error("Máximo 8MB");
            return false;
        }
        return true;
    };

    const onUpload = async () => {
        if (!active || !selectedFile) return;
        if (!validateFile(selectedFile)) return;

        const fd = new FormData();
        fd.append("file", selectedFile);
        fd.append("documentoTipoId", active.documentoTipoId);

        setUploading(true);
        try {
            await axios.post(`/api/postulaciones/${postulacionId}/documentos`, fd);
            toast.success("Documento subido");
            setOpen(false);
            setActive(null);
            setSelectedFile(null);
            mutate();
        } catch (e) {
            toast.error("No se pudo subir");
        } finally {
            setUploading(false);
        }
    };

    const askDelete = (doc: DocItem) => {
        setToDelete(doc);
        setConfirmDelOpen(true);
    };

    const doDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);

        // optimista: quitar url/estado local
        const prev = data;
        mutate((curr) => {
            if (!curr) return curr;
            return {
                ...curr,
                docs: curr.docs.map((x) =>
                    x.documentoTipoId === toDelete.documentoTipoId
                        ? { ...x, url: null, estado: "PENDIENTE" as const }
                        : x
                ),
            };
        }, { revalidate: false });

        try {
            await axios.delete(`/api/postulaciones/${postulacionId}/documentos`, {
                data: { documentoTipoId: toDelete.documentoTipoId },
            });
            toast.success("Documento eliminado");
            mutate();
        } catch (e) {
            mutate(prev, { revalidate: false });
            toast.error("No se pudo eliminar");
        } finally {
            setDeleting(false);
            setConfirmDelOpen(false);
            setToDelete(null);
        }
    };


    if (error) {
        return (
            <div className="p-6 text-red-600">
                Error al cargar documentación
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
                <Card className="mb-2">
                    <CardContent className="p-6 space-y-4">
                        {/* Contexto */}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold">
                                Documentación de contratación
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Oferta:{" "}
                                <span className="font-medium text-foreground">
                                    {ofertaNombre || "—"}
                                </span>
                                {empresaNombre && (
                                    <>
                                        {" "}• <span className="text-muted-foreground">{empresaNombre}</span>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Mensaje al candidato */}
                        <div className="rounded-lg border bg-slate-50 p-4 text-sm leading-relaxed">
                            <strong>¡Estimado/a {nombreCandidato}!</strong>
                            <br />
                            Es un placer informarte que has sido considerado/a para continuar en el
                            proceso de contratación. Para avanzar, es necesario que cargués la
                            documentación solicitada a continuación.
                            <br />
                            <span className="text-muted-foreground">
                                Los documentos marcados como requeridos deben completarse para finalizar
                                el proceso.
                            </span>
                        </div>

                        {/* Progreso */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Progreso de documentos requeridos</span>
                                <span className="text-muted-foreground">
                                    {reqSubidos}/{requeridos.length}
                                </span>
                            </div>
                            <Progress value={progreso} />
                        </div>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2 mt-2" />
                                    <Skeleton className="h-9 w-full mt-4" />
                                    <Skeleton className="h-9 w-full mt-2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {docs.map((d) => {
                            const done = d.estado === "SUBIDO" || d.estado === "APROBADO";
                            return (
                                <Card
                                    key={d.documentoTipoId}
                                    className={cn("transition-colors overflow-hidden", done ? "border-emerald-200" : "border-red-200")}
                                >
                                    <CardContent className="p-4 space-y-3 overflow-hidden">
                                        {/* Título */}
                                        <div className="text-sm font-medium">{d.nombre}</div>

                                        {/* Estado */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {d.requerido ? "Requerido" : "Opcional"} • Estado: {d.estado}
                                            </span>

                                            {done && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Cargado
                                                </span>
                                            )}
                                        </div>

                                        {/* Acción principal */}
                                        <Button
                                            variant={done ? "secondary" : "default"}
                                            className="w-full"
                                            onClick={() => openUpload(d)}
                                        >
                                            {done ? "Reemplazar documento" : "Subir documento"}
                                        </Button>

                                        {/* Acciones secundarias */}
                                        {done && d.url && (
                                            <TooltipProvider>
                                                <div className="flex items-center justify-center gap-3">
                                                    {/* VER */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-md"
                                                                onClick={() => window.open(d.url!, "_blank", "noopener,noreferrer")}
                                                                aria-label="Ver archivo"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver</TooltipContent>
                                                    </Tooltip>

                                                    {/* ELIMINAR */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-md"
                                                                onClick={() => askDelete(d)}
                                                                aria-label="Eliminar archivo"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Eliminar</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        )}

                                        {!done && (
                                            <p className="text-xs text-muted-foreground">
                                                Formato permitido: JPG, PNG o PDF • Máx 8MB
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <Dialog
                    open={open}
                    onOpenChange={(v) => {
                        setOpen(v);
                        if (!v) {
                            setActive(null);
                            setSelectedFile(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{active?.nombre ?? "Subir documento"}</DialogTitle>
                        </DialogHeader>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setSelectedFile(f);
                            }}
                        />
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileRef.current?.click()}
                            className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-6 text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-60"
                        >
                            <UploadCloud className="h-8 w-8" />
                            <span className="text-sm font-medium">
                                Hacé clic para seleccionar un archivo
                            </span>
                            <span className="text-xs text-muted-foreground">
                                JPG, PNG o PDF • Máx 8MB
                            </span>
                        </button>

                        {/* Preview del archivo */}
                        {selectedFile && (
                            <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 p-2 text-sm">
                                <FileText className="h-4 w-4 text-emerald-600" />
                                <span className="truncate">{selectedFile.name}</span>
                            </div>
                        )}

                        {/* Acción */}
                        <Button
                            className="mt-4 w-full"
                            disabled={!selectedFile || uploading}
                            onClick={onUpload}
                        >
                            {uploading ? "Subiendo..." : "Subir documento"}
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Tip: foto nítida, sin sombras ni reflejos. Que el texto se lea claro.
                        </p>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={confirmDelOpen} onOpenChange={setConfirmDelOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esto eliminará el archivo y el documento volverá a estado <strong>PENDIENTE</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={doDelete} disabled={deleting}>
                                {deleting ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </main>
        </div>
    );
}