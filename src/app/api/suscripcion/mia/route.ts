import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

function daysBetween(a: Date, b: Date) {
    const MS = 24 * 60 * 60 * 1000;
    return Math.ceil((b.getTime() - a.getTime()) / MS);
}

export async function GET() {
    try {
        const { empresaId } = await requireEmpresaSession();

        // Suscripción activa
        const sub = await prisma.suscripcion.findFirst({
            where: { empresaId, activa: true },
            include: { plan: true },
        });

        if (!sub) {
            return NextResponse.json({
                ok: true,
                plan: null,
                meta: {
                    ofertasActivas: 0,
                    restantes: 0,
                    diasParaVencer: null,
                    vencePronto: false,
                    expirada: true,
                },
            });
        }

        // Ofertas activas de la empresa
        const ofertasActivas = await prisma.ofertaLaboral.count({
            where: { empresaId, estado: { in: ["PENDIENTE", "ABIERTA"] } },
        });

        const restantes = Math.max(sub.plan.maxOfertasActivas - ofertasActivas, 0);
        const hoy = new Date();
        const diasParaVencer = daysBetween(hoy, sub.fechaFin);
        const vencePronto = diasParaVencer <= 7;
        const expirada = sub.fechaFin < hoy;

        return NextResponse.json({
            ok: true,
            plan: {
                nombre: sub.plan.nombre as "Gratis" | "Básico" | "Premium" | string,
                maxOfertasActivas: sub.plan.maxOfertasActivas,
                incluyeDestacado: sub.plan.incluyeDestacado,
                precioMensual: sub.plan.precioMensual,
                duracionMeses: sub.plan.duracionMeses,
                fechaInicio: sub.fechaInicio,
                fechaFin: sub.fechaFin,
            },
            meta: {
                ofertasActivas,
                restantes,
                diasParaVencer,
                vencePronto,
                expirada,
            },
        });
    } catch (e) {
        console.error("GET /api/suscripcion/mia error:", e);
        return NextResponse.json({ ok: false, message: "No autorizado" }, { status: 403 });
    }
}
