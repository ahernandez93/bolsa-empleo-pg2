// app/api/billing/cancel-subscription/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
    try {
        const { empresaId, rol } = await requireEmpresaSession();
        if (!empresaId) {
            return NextResponse.json({ message: "Empresa no asociada" }, { status: 400 });
        }
        if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
            return NextResponse.json({ message: "No autorizado" }, { status: 403 });
        }

        const sub = await prisma.suscripcion.findFirst({
            where: { empresaId, activa: true },
        });

        if (!sub) {
            return NextResponse.json({ message: "No tienes una suscripción activa" }, { status: 400 });
        }

        // Si es plan Gratis (sin Stripe)
        if (!sub.stripeSubscriptionId) {
            return NextResponse.json({
                ok: true,
                message: "Ya estás en el plan Gratis. No hay suscripción de pago para cancelar.",
            });
        }

        // Si es plan de pago (Stripe) cancelar al final del periodo
        const stripeSub = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        await prisma.suscripcion.update({
            where: { id: sub.id },
            data: {
                canceladaEn: new Date(),
                stripeStatus: stripeSub.status
            },
        });

        return NextResponse.json({
            ok: true,
            message:
                "Tu suscripción se cancelará al finalizar el periodo actual. No se renovará automáticamente.",
        });
    } catch (e) {
        console.error("POST /api/billing/cancel-subscription", e);
        return NextResponse.json(
            { message: "Error al cancelar la suscripción" },
            { status: 500 }
        );
    }
}
