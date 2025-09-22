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

export default function PlanesClient({ planes, actual }: { planes: Plan[]; actual: string | null }) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const onSelect = async (planNombre: "Gratis" | "Básico" | "Premium") => {
        try {
            setLoading(planNombre);
            schema.parse({ planNombre });
            const res = await axios.post("/api/suscripcion/cambiar", { planNombre });
            toast.success(res.data?.message ?? `Plan cambiado a ${planNombre}`);
            router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "No se pudo cambiar el plan";
            toast.error(msg);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-2">
            <h1 className="text-2xl font-bold">Planes y precios</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {planes.map((p) => {
                    const isActual = p.nombre === actual;
                    return (
                        <Card key={p.id} className={isActual ? "border-emerald-500" : ""}>
                            <CardContent className="p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-semibold">{p.nombre}</div>
                                    {isActual && <Badge variant="secondary">Actual</Badge>}
                                </div>
                                <div className="text-3xl font-bold">
                                    {p.precioMensual === 0 ? "Gratis" : `L. ${p.precioMensual.toFixed(2)}`} <span className="text-sm text-muted-foreground">/ {p.duracionMeses} mes{p.duracionMeses > 1 ? "es" : ""}</span>
                                </div>
                                <ul className="text-sm space-y-1">
                                    <li>Hasta <b>{p.maxOfertasActivas}</b> ofertas activas</li>
                                    <li>{p.incluyeDestacado ? "Incluye" : "Sin"} oferta destacada</li>
                                    {p.descripcion && <li className="text-muted-foreground">{p.descripcion}</li>}
                                </ul>
                                <Button
                                    disabled={loading === p.nombre || isActual}
                                    onClick={() => onSelect(p.nombre as "Gratis" | "Básico" | "Premium")}
                                    className="w-full"
                                >
                                    {isActual ? "Plan actual" : loading === p.nombre ? "Procesando..." : "Seleccionar"}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <p className="text-xs text-muted-foreground">
                * Este cambio simula un pago (mock). En producción, aquí iría el checkout real (Stripe u otro) y el webhook para activar la suscripción.
            </p>
        </div>
    );
}
