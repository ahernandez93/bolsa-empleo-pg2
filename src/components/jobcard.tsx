import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Briefcase } from "lucide-react";
import type { JobCardProps } from "@/components/jobcarousel";
import { useState, useTransition } from "react";
import { useSession, /* signIn */ } from "next-auth/react"; // si usas next-auth
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
    /* AlertDialogTrigger, */
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function JobCard({ id, puesto, area, ubicacionDepartamentoId, ubicacionDepartamentoDescripcion, ubicacionCiudadId, ubicacionCiudadDescripcion, empresa, tipoTrabajo, modalidad, fechaCreacion, alreadyApplied }: JobCardProps) {

    const { status } = useSession(); // "authenticated" | "unauthenticated" | "loading"
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [applied, setApplied] = useState(!!alreadyApplied);
    const router = useRouter();
    const canApply = status === "authenticated" && !applied;

    const handleApply = () => {
        if (status !== "authenticated") {
            toast.info("Necesitas iniciar sesión para postular");
            // redirige o invoca next-auth
            router.push('/login') //signIn(); // o 
            return;
        }
        setOpen(true);
    };

    const confirmApply = () => {
        startTransition(async () => {
            try {
                const res = await axios.post("/api/postulaciones", { ofertaId: id });
                console.log(res.data);
                if (res.status === 201) {
                    setApplied(true);
                    toast.success("Postulación enviada correctamente");
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    toast.error(err.response?.data?.message || "No se pudo postular");
                } else {
                    toast.error("Error de red al postular");
                }
            } finally {
                setOpen(false);
            }
        });
    };

    return (
        <Card className="h-full border-slate-200 flex flex-col">
            <CardHeader className="pb-0">
                <div className="flex items-center gap-2">
                    {/* <Avatar className="h-8 w-8">
                        <AvatarFallback>{empresa[0]}</AvatarFallback>
                    </Avatar> */}
                    <div className="min-w-0">
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
                {/* <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">{modality}</Badge>
                    <Badge variant="secondary" className="rounded-full">{contract}</Badge>
                    <Badge variant="secondary" className="rounded-full">{department}</Badge>
                </div> */}
                <div className="flex gap-2 pt-1">
                    <Button
                        className="w-full"
                        onClick={handleApply}
                        disabled={isPending || !canApply}
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
        </Card>
    );
}
