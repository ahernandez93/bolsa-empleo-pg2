"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FormCreateOferta } from "./FormCreateOferta";
import { usePlanActual } from "@/hooks/use-plan-actual";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RolUsuario = "ADMIN" | "RECLUTADOR" | "SUPERADMIN";

type HeaderOfertasLaboralesProps = {
    currentUserRole: RolUsuario;
    reclutadores: { id: string; nombre: string; email: string }[];
};

export function HeaderOfertasLaborales({
    currentUserRole,
    reclutadores,
}: HeaderOfertasLaboralesProps) {
    const [openModalCreate, setOpenModalCreate] = useState(false);
    const { plan, meta, isLoading } = usePlanActual();

    const { canCreate, reason } = useMemo(() => {
        if (isLoading) return { canCreate: false, reason: "Cargando plan…" };

        // Sin plan activo (edge-case)
        if (!plan || !meta) return { canCreate: false, reason: "No tienes una suscripción activa." };

        // Expirada
        if (meta.expirada) return { canCreate: false, reason: "Tu suscripción ha expirado." };

        // Alcanzó el límite
        if (meta.ofertasActivas >= plan.maxOfertasActivas) {
            return {
                canCreate: false,
                reason: `Has alcanzado el límite de ${plan.maxOfertasActivas} ofertas activas en ${plan.nombre}.`,
            };
        }

        return { canCreate: true, reason: "" };
    }, [plan, meta, isLoading]);

    // Abrir modal solo si el plan lo permite
    const handleOpenChange = (next: boolean) => {
        if (next && !canCreate) return; // bloquea apertura
        setOpenModalCreate(next);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Encabezado */}
            <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl">Listado de Ofertas Laborales</h2>

                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <span>
                                <Dialog open={openModalCreate} onOpenChange={handleOpenChange}>
                                    <DialogTrigger asChild>
                                        <Button disabled={!canCreate || isLoading}>
                                            {isLoading ? "Verificando…" : "Agregar Oferta Laboral"}
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-4xl p-0 bg-background border shadow-lg">
                                        <DialogHeader className="px-6 pt-6">
                                            <DialogTitle>Nueva Oferta Laboral</DialogTitle>
                                            <DialogDescription>
                                                Ingrese los datos de la nueva oferta laboral
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="px-6 pb-6 max-h-[80vh] overflow-y-auto">
                                            <FormCreateOferta
                                                setOpenModalCreate={setOpenModalCreate}
                                                isEditMode={false}
                                                initialData={null}
                                                currentUserRole={currentUserRole}
                                                reclutadores={reclutadores}
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </span>
                        </TooltipTrigger>

                        {!canCreate && !isLoading && (
                            <TooltipContent side="bottom" className="max-w-xs">
                                <p className="text-sm">
                                    {reason}{" "}
                                    <Link href="/admin/planes" className="underline">
                                        Cambiar de plan
                                    </Link>
                                    .
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Bloqueo suave / avisos */}
            {!isLoading && (
                <div className="px-4">
                    {/* Aviso por expiración */}
                    {meta?.expirada && (
                        <Alert variant="destructive">
                            <AlertTitle>Suscripción expirada</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                Tu suscripción ha vencido. No puedes crear nuevas ofertas.
                                <Link href="/admin/planes" className="ml-3 underline">
                                    Renovar plan
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Aviso por límite alcanzado */}
                    {!meta?.expirada &&
                        plan &&
                        meta &&
                        meta.ofertasActivas >= plan.maxOfertasActivas && (
                            <Alert>
                                <AlertTitle>Límite alcanzado</AlertTitle>
                                <AlertDescription className="flex flex-wrap items-center gap-2">
                                    <span>Ya tienes</span>
                                    <b className="mx-0 tabular-nums">
                                        {meta.ofertasActivas}/{plan.maxOfertasActivas}
                                    </b>
                                    <span>ofertas activas en plan</span>
                                    <Badge variant="secondary">{plan.nombre}</Badge>
                                    <span>•</span>
                                    <span>Cierra alguna oferta o</span>
                                    <Link href="/admin/planes" className="underline">
                                        actualiza tu plan
                                    </Link>
                                    <span>.</span>
                                </AlertDescription>
                            </Alert>
                        )}
                </div>
            )}
        </div>
    );
}
