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
        const { empresaId, rol } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json({
                ok: true,
                rol, // 👈 importante para el frontend
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

        // Suscripción activa
        const sub = await prisma.suscripcion.findFirst({
            where: { empresaId, activa: true },
            include: { plan: true },
        });

        if (!sub) {
            return NextResponse.json({
                ok: true,
                rol,
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

        /* const diasParaVencer = daysBetween(hoy, sub.fechaFin);
        const vencePronto = diasParaVencer <= 7;
        const expirada = sub.fechaFin < hoy; */

        const fechaFinEfectiva: Date | null =
            sub.currentPeriodEnd ?? sub.fechaFin ?? null;

        let diasParaVencer: number | null = null;
        let vencePronto = false;
        let expirada = false;

        if (fechaFinEfectiva) {
            diasParaVencer = daysBetween(hoy, fechaFinEfectiva);
            expirada = fechaFinEfectiva < hoy;
            vencePronto = !expirada && diasParaVencer <= 7;
        }

        // 👇 Consideramos también el estado Stripe si existe
        const stripeStatus = sub.stripeStatus as string | null;
        const isStripeActive =
            !stripeStatus || stripeStatus === "active" || stripeStatus === "trialing";

        // Si Stripe dice que no está activa, la tratamos como expirada aunque la fecha esté en futuro
        if (!isStripeActive) {
            expirada = true;
            vencePronto = false;
        }

        return NextResponse.json({
            ok: true,
            rol,
            plan: {
                nombre: sub.plan.nombre as "Gratis" | "Básico" | "Premium" | string,
                maxOfertasActivas: sub.plan.maxOfertasActivas,
                incluyeDestacado: sub.plan.incluyeDestacado,
                precioMensual: sub.plan.precioMensual,
                duracionMeses: sub.plan.duracionMeses,
                fechaInicio: sub.fechaInicio,
                fechaFin: fechaFinEfectiva ?? sub.fechaFin,
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
