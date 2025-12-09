"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({ planNombre: z.enum(["Gratis", "Básico", "Premium"]) });

type Plan = {
    id: string;
    nombre: "Gratis" | "Básico" | "Premium" | string;
    descripcion: string | null;
    precioMensual: number;
    duracionMeses: number;
    maxOfertasActivas: number;
    incluyeDestacado: boolean;
};

type SuscripcionInfo = {
    status: string | null;
    fechaFin: string | null; // ISO string
};

export default function PlanesClient({
    planes,
    actual,
    suscripcionInfo,
}: {
    planes: Plan[];
    actual: string | null;
    suscripcionInfo?: SuscripcionInfo | null;
}) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const onSelect = async (planNombre: "Gratis" | "Básico" | "Premium") => {
        try {
            setLoading(planNombre);
            schema.parse({ planNombre });

            // 👉 1) Plan GRATIS: se sigue manejando con tu endpoint viejo
            if (planNombre === "Gratis") {
                const res = await axios.post("/api/suscripcion/cambiar", { planNombre });
                toast.success(res.data?.message ?? `Plan cambiado a ${planNombre}`);
                router.refresh();
                return;
            }

            // 👉 2) Planes de pago: crear sesión de Stripe y redirigir al checkout
            const res = await axios.post("/api/billing/create-checkout-session", {
                planNombre,
            });

            const url = res.data?.url as string | undefined;
            if (!url) {
                throw new Error("No se recibió la URL de checkout desde el servidor");
            }

            // Redirección a Stripe Checkout
            window.location.href = url;
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ?? e?.message ?? "No se pudo procesar el plan";
            toast.error(msg);
        } finally {
            setLoading(null);
        }
    };

    const statusLabel = (() => {
        if (!suscripcionInfo) return "Sin suscripción registrada";

        const raw = suscripcionInfo.status ?? "";

        switch (raw) {
            case "active":
                return "Activa";
            case "trialing":
                return "Activa (en período de prueba)";
            case "past_due":
                return "Con pagos pendientes";
            case "canceled":
                return "Cancelada";
            case "incomplete":
                return "Incompleta (pago inicial pendiente)";
            case "unpaid":
                return "Sin pagar";
            default:
                return raw || "Desconocido";
        }
    })();

    const fechaVencimientoTexto = (() => {
        if (!suscripcionInfo?.fechaFin) return "—";

        const d = new Date(suscripcionInfo.fechaFin);
        return d.toLocaleDateString("es-HN", {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
    })();

    return (
        <div className="flex flex-col gap-6 p-2">
            <h1 className="text-2xl font-bold">Planes y precios</h1>

            {/* Resumen de suscripción actual */}
            <Card className="border-muted">
                <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-muted-foreground">
                            Resumen de suscripción
                        </p>
                        <p className="text-lg font-bold">
                            Plan actual:{" "}
                            {actual ? (
                                <span className="font-semibold">{actual}</span>
                            ) : (
                                <span className="text-muted-foreground">Sin plan asignado</span>
                            )}
                        </p>
                        <p className="text-sm">
                            Estado: <span className="font-medium">{statusLabel}</span>
                        </p>
                        <p className="text-sm">
                            Fecha de vencimiento:{" "}
                            <span className="font-medium">{fechaVencimientoTexto}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Cards de planes */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {planes.map((p) => {
                    const isActual = p.nombre === actual;
                    const isFree = p.precioMensual === 0;

                    return (
                        <Card key={p.id} className={isActual ? "border-emerald-500" : ""}>
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-semibold">{p.nombre}</div>
                                    {isActual && <Badge variant="secondary">Actual</Badge>}
                                </div>
                                <div className="text-3xl font-bold">
                                    {isFree ? "Gratis" : `L. ${p.precioMensual.toFixed(2)}`}{" "}
                                    <span className="text-sm text-muted-foreground">
                                        / {p.duracionMeses} mes
                                        {p.duracionMeses > 1 ? "es" : ""}
                                    </span>
                                </div>
                                <ul className="text-sm space-y-1">
                                    <li>
                                        Hasta <b>{p.maxOfertasActivas}</b> ofertas activas
                                    </li>
                                    <li>
                                        {p.incluyeDestacado ? "Incluye" : "Sin"} oferta destacada
                                    </li>
                                    {p.descripcion && (
                                        <li className="text-muted-foreground">{p.descripcion}</li>
                                    )}
                                </ul>
                                <Button
                                    disabled={loading === p.nombre || isActual}
                                    onClick={() =>
                                        onSelect(p.nombre as "Gratis" | "Básico" | "Premium")
                                    }
                                    className="w-full"
                                >
                                    {isActual
                                        ? "Plan actual"
                                        : loading === p.nombre
                                            ? "Procesando..."
                                            : isFree
                                                ? "Cambiar a este plan"
                                                : "Suscribirse"}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <p className="text-xs text-muted-foreground">
                * El plan Gratis se activa directamente en la plataforma. Los planes de
                pago te redirigen a Stripe para completar el pago de la suscripción.
            </p>
        </div>
    );
}
