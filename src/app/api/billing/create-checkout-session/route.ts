import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
    throw new Error("Falta STRIPE_SECRET_KEY en el .env");
}

const stripe = new Stripe(stripeSecret);

// Body esperado
const bodySchema = z.object({
    planNombre: z.enum(["Básico", "Premium"]), // Gratis no debe llegar aquí
});

const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Mapeo planNombre → priceId de Stripe (mensual)
const PLAN_PRICE_MAP: Record<"Básico" | "Premium", string | undefined> = {
    "Básico": process.env.STRIPE_PRICE_BASIC_MONTHLY,
    "Premium": process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
};

export async function POST(req: Request) {
    try {
        const { empresaId, rol } = await requireEmpresaSession();

        if (!empresaId) {
            return NextResponse.json(
                { message: "Empresa no asociada" },
                { status: 400 }
            );
        }

        if (rol !== "ADMIN" && rol !== "SUPERADMIN") {
            return NextResponse.json(
                { message: "No autorizado" },
                { status: 403 }
            );
        }

        const json = await req.json();
        const { planNombre } = bodySchema.parse(json);

        // Seguridad extra: si algún loquito manda "Gratis" por aquí
        /* if (planNombre === "Gratis") {
            return NextResponse.json(
                {
                    message:
                        "El plan Gratis no usa Stripe. Usar /api/suscripcion/cambiar.",
                },
                { status: 400 }
            );
        } */

        // Traer el plan desde la BD (por nombre)
        const plan = await prisma.plan.findUnique({
            where: { nombre: planNombre },
            select: {
                id: true,
                nombre: true,
                duracionMeses: true,
                maxOfertasActivas: true,
            },
        });

        if (!plan) {
            return NextResponse.json(
                { message: "Plan no encontrado" },
                { status: 404 }
            );
        }

        // Chequeo de downgrade: igual que en /api/suscripcion/cambiar
        const activas = await prisma.ofertaLaboral.count({
            where: { empresaId, estado: { in: ["PENDIENTE", "ABIERTA"] } },
        });

        if (activas > plan.maxOfertasActivas) {
            return NextResponse.json(
                {
                    message: `No se puede cambiar a ${plan.nombre}. Tenés ${activas} ofertas activas y el límite es ${plan.maxOfertasActivas}. Cierra o archiva ofertas primero.`,
                },
                { status: 400 }
            );
        }

        // Buscar la empresa para leer/guardar stripeCustomerId
        const empresa = await prisma.empresa.findUnique({
            where: { id: empresaId },
            select: {
                id: true,
                nombre: true,
                stripeCustomerId: true,
            },
        });

        if (!empresa) {
            return NextResponse.json(
                { message: "Empresa no encontrada" },
                { status: 404 }
            );
        }

        // Conseguir o crear el Stripe Customer
        let stripeCustomerId = empresa.stripeCustomerId ?? undefined;

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                name: empresa.nombre,
                // Si querés, acá también podés pasar email de algún admin
                metadata: {
                    empresaId: empresa.id,
                },
            });

            stripeCustomerId = customer.id;

            // Guardar el customerId en la empresa para futuros cobros
            await prisma.empresa.update({
                where: { id: empresa.id },
                data: { stripeCustomerId },
            });
        }

        const priceId = PLAN_PRICE_MAP[planNombre];

        if (!priceId) {
            return NextResponse.json(
                {
                    message: `No hay priceId configurado para el plan ${planNombre}. Revisá las variables STRIPE_PRICE_* en el .env`,
                },
                { status: 500 }
            );
        }

        // Crear la Checkout Session en modo suscripción
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Importantísimo: para luego saber a quién pertenece en el webhook
            metadata: {
                empresaId: empresa.id,
                planId: plan.id,
                planNombre: plan.nombre,
            },
            subscription_data: {
                metadata: {
                    empresaId: empresa.id,
                    planId: plan.id,
                    planNombre: plan.nombre,
                },
            },
            success_url: `${APP_URL}/dashboard/billing?checkout=success`,
            cancel_url: `${APP_URL}/dashboard/billing?checkout=cancelled`,
        });

        if (!session.url) {
            return NextResponse.json(
                { message: "No se pudo crear la sesión de pago" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            url: session.url,
        });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error("POST /api/billing/create-checkout-session", e);

        if (e instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message:
                        e.issues?.[0]?.message ?? "Datos inválidos en la petición",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Error interno al crear la sesión de pago" },
            { status: 500 }
        );
    }
}
