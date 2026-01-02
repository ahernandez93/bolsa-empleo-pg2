"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Briefcase, CheckCircle2, XCircle } from "lucide-react";
import type { JobCardProps } from "@/components/jobcarousel";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BotonGuardarOferta } from "@/components/ofertas/BotonGuardarOferta";
import { VerDetalleOfertaQuickView } from "@/app/(candidato)/ofertas/VerDetalleOfertaQuickView";
import useSWR from "swr";

type Props = JobCardProps & {
    onToggleSaved?: (next: boolean) => void;
};

const fetcher = (url: string) => axios.get(url).then(r => r.data);

type Eligibility = { canApply: boolean; missing: string[] };

export default function JobCard({ id, puesto, area, ubicacionDepartamentoDescripcion, ubicacionCiudadDescripcion, empresa, tipoTrabajo, modalidad, fechaCreacion, alreadyApplied, isSaved, onToggleSaved }: Props) {

    const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const [open, setOpen] = useState(false);
    const [openPerfil, setOpenPerfil] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [applied, setApplied] = useState(!!alreadyApplied);
    const router = useRouter();

    const shouldCheck = status === "authenticated" && !applied;

    const { data: eligibility, isLoading: eligibilityLoading } = useSWR<Eligibility>(
        shouldCheck ? "/api/candidatos/eligibility" : null,
        fetcher
    );

    const missing = eligibility?.missing ?? [];
    const perfilOk = eligibility?.canApply ?? false;

    //const canApply = status === "authenticated" && !applied && perfilOk;

    const handleApply = () => {
        if (status !== "authenticated") {
            toast.info("Necesitas iniciar sesión para postular");
            router.push('/login')
            return;
        }

        if (!perfilOk) {
            setOpenPerfil(true);
            return;
        }

        setOpen(true);
    };

    const confirmApply = () => {
        startTransition(async () => {
            try {
                const res = await axios.post("/api/postulaciones", { ofertaId: id });
                if (res.status === 201) {
                    setApplied(true);
                    toast.success("Postulación enviada correctamente");
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    const statusCode = err.response?.status;
                    const code = err.response?.data?.code;

                    if (statusCode === 422 && code === "PERFIL_INCOMPLETO") {
                        setOpen(false);
                        setOpenPerfil(true);
                        toast.info("Tu perfil está incompleto. Completalo para postular.");
                        return;
                    }

                    if (statusCode === 409) {
                        setApplied(true);
                        toast.info("Ya habías aplicado a esta oferta.");
                        return;
                    }
                    toast.error(err.response?.data?.message || "No se pudo postular");
                } else {
                    toast.error("Error de red al postular");
                }
            } finally {
                setOpen(false);
            }
        });
    };

    const goCompletarPerfil = () => {
        const redirect = `/ofertas`;
        router.push(`/perfil?redirect=${encodeURIComponent(redirect)}`);
    };

    const item = (label: string, ok: boolean) => (
        <div className="flex items-center gap-2 text-xs">
            {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-600" />}
            <span className={ok ? "text-muted-foreground" : "text-slate-700"}>{label}</span>
        </div>
    );

    const showChecklist = status === "authenticated" && !applied && !eligibilityLoading && missing.length > 0;

    return (
        <Card className="relative h-full border-slate-200 flex flex-col">
            <div className="absolute top-2 right-2">
                <BotonGuardarOferta
                    ofertaId={id}
                    saved={!!isSaved}
                    onChange={onToggleSaved}
                />
            </div>
            <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                    <div className="min-w-0">
                        <div className="text-sm text-muted-foreground">{empresa}</div>
                        <CardTitle className="truncate text-lg">{puesto}</CardTitle>
                        <p className="truncate text-xs text-slate-500">{area}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                <div className="grid grid-cols-1 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{ubicacionCiudadDescripcion} - {ubicacionDepartamentoDescripcion}</span>
                    <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{modalidad}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{tipoTrabajo}</span>
                </div>
                {showChecklist && (
                    <div className="rounded-md border p-3 bg-muted/40">
                        <div className="text-xs font-medium mb-2">Para postular necesitás:</div>
                        <div className="space-y-1">
                            {item("Currículum (PDF) subido", !missing.includes("cv"))}
                            {item("Teléfono agregado", !missing.includes("telefono"))}
                            {item("Ubicación (departamento y ciudad)", !missing.includes("ubicacion"))}
                        </div>
                        <div className="mt-3">
                            <Button variant="secondary" size="sm" onClick={goCompletarPerfil} className="w-full">
                                Completar perfil
                            </Button>
                        </div>
                    </div>
                )}
                <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="min-w-0">
                        <div className="w-full">
                            <VerDetalleOfertaQuickView ofertaId={id} />
                        </div>
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleApply}
                        //disabled={isPending || applied /* !canApply */}
                        disabled={isPending || applied || (status === "authenticated" && eligibilityLoading)}
                    >
                        {applied ? "Ya postulaste" : "Aplicar ahora"}
                    </Button>
                </div>
                <div className="flex gap-2 pt-1 text-sm text-slate-500 justify-end">
                    <span>Publicada{" "}
                        {formatDistanceToNow(new Date(fechaCreacion), {
                            addSuffix: true,
                            locale: es,
                        })}</span>
                </div>
            </CardContent>
            {/* Modal de confirmación */}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmás tu postulación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se enviará tu perfil al reclutador de <strong>{empresa}</strong> para el puesto <strong>{puesto}</strong>.
                            Podrás ver el estado en tu panel de postulaciones.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmApply} disabled={isPending}>
                            {isPending ? "Enviando..." : "Confirmar postulación"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal perfil incompleto */}
            <AlertDialog open={openPerfil} onOpenChange={setOpenPerfil}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Completá tu perfil para postular</AlertDialogTitle>
                        <AlertDialogDescription>
                            Para que las empresas puedan contactarte, necesitás completar los datos mínimos del perfil (CV, teléfono y
                            ubicación).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={goCompletarPerfil}>Completar perfil</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
