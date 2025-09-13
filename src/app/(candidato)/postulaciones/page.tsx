"use client";

import useSWR from "swr";
import axios from "axios";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EstadoPostulacion = | "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA" | "RETIRADA";

type PostulacionItem = {
    id: string;
    estado: EstadoPostulacion;
    fechaPostulacion: string;
    fechaActualizacion: string;
    oferta: {
        id: string;
        puesto: string;
        empresa: string;
        modalidad: string;
        tipoTrabajo: string;
        ubicacionCiudad: { nombre: string };
        ubicacionDepartamento: { nombre: string };
    }
};

const fetcher = (url: string) => axios.get(url).then(res => res.data);

function estadoBadgeVariant(estado: EstadoPostulacion) {
    switch (estado) {
        case "SOLICITUD":
            return "bg-muted text-foreground"; //"secondary";
        case "ENTREVISTA":
            return "bg-blue-600 text-white"; //"outline";
        case "EVALUACIONES":
            return "bg-yellow-500 text-white"; //"default";
        case "CONTRATACION":
            return "bg-green-600 text-white"; //"default";
        case "RECHAZADA":
            return "bg-red-600 text-white"; //"destructive";
        case "RETIRADA":
            return "bg-muted text-foreground"; //"secondary";
        default:
            return "bg-muted text-foreground"; //"secondary";
    }
}

export default function PanelPostulaciones() {
    const { data, error, isLoading, mutate } = useSWR<{ postulaciones: PostulacionItem[] }>(
        "/api/postulaciones/mias",
        fetcher,
        { revalidateOnFocus: false }
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const postulaciones = useMemo(() => data?.postulaciones ?? [], [data]);

    const onWithdraw = (id: string) => {
        setSelectedId(id);
        setConfirmOpen(true);
    };

    const confirmWithdraw = async () => {
        if (!selectedId) return;
        setLoadingAction(true);
        try {
            await axios.patch(`/api/postulaciones/${selectedId}`, { accion: "RETIRAR" });
            toast.success("Postulación retirada");
            mutate(); // refresca la lista
        } catch (err) {
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
        return <div className="p-6">Cargando tus postulaciones...</div>;
    }
    if (error) {
        return <div className="p-6 text-red-600">Error al cargar postulaciones</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Postulaciones</CardTitle>
            </CardHeader>
            <CardContent>
                {postulaciones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aún no tienes postulaciones.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Puesto</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Ubicación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Postulado</TableHead>
                                <TableHead>Actualización</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {postulaciones.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.oferta.puesto}</TableCell>
                                    <TableCell>{p.oferta.empresa}</TableCell>
                                    <TableCell>
                                        {p.oferta.ubicacionCiudad.nombre} - {p.oferta.ubicacionDepartamento.nombre}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={estadoBadgeVariant(p.estado)}>
                                            {p.estado.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(p.fechaPostulacion), "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(p.fechaActualizacion), "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onWithdraw(p.id)}
                                            disabled={["ACEPTADA", "OFERTA", "RECHAZADA", "RETIRADA"].includes(p.estado)}
                                        >
                                            Retirar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

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
                        <AlertDialogAction /* onClick={confirmWithdraw} */ disabled={loadingAction}>
                            {loadingAction ? "Retirando..." : "Confirmar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
