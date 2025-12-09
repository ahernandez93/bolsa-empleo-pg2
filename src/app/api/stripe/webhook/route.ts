import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!stripeSecret) {
    throw new Error("Falta STRIPE_SECRET_KEY en el .env");
}
if (!webhookSecret) {
    throw new Error("Falta STRIPE_WEBHOOK_SECRET en el .env");
}

const stripe = new Stripe(stripeSecret);

// helper: decidir si la suscripción está activa
function isActiveStripeStatus(status: string | null | undefined) {
    return status === "active" || status === "trialing";
}

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export async function POST(req: Request) {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { message: "Firma de Stripe faltante" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        // OJO: hay que leer el body como texto crudo, no como JSON
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("Error verificando firma del webhook:", err?.message);
        return NextResponse.json(
            { message: `Webhook error: ${err.message}` },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;

                const stripeSubscriptionId = subscription.id;
                const stripeCustomerId = subscription.customer as string;
                const stripeStatus = subscription.status;
                const stripePriceId = subscription.items.data[0]?.price.id ?? null;

                // metadata que pusimos en create-checkout-session
                const meta = subscription.metadata || {};
                const empresaId = meta.empresaId;
                const planId = meta.planId;

                if (!empresaId || !planId) {
                    console.warn(
                        "Suscripción recibida sin empresaId o planId en metadata. Ignorando."
                    );
                    break;
                }

                const planDb = await prisma.plan.findUnique({
                    where: { id: planId },
                    select: { duracionMeses: true },
                });

                const duracionMeses = planDb?.duracionMeses ?? 1;

                //Fecha de inicio según Stripe
                const fechaInicio = new Date(subscription.start_date * 1000);

                //Intentamos leer current_period_end POR SI ACASO lo manda,
                //pero si no, calculamos con duracionMeses
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawCurrentPeriodEnd = (subscription as any)["current_period_end"] as
                    | number
                    | undefined;

                let currentPeriodEnd: Date | null = null;

                if (rawCurrentPeriodEnd != null) {
                    currentPeriodEnd = new Date(rawCurrentPeriodEnd * 1000);
                }

                const fechaFin = currentPeriodEnd ?? addMonths(fechaInicio, duracionMeses);

                // Desactivar *todas* las suscripciones activas de esa empresa.
                // Luego el upsert vuelve a activar SOLO la del stripeSubscriptionId actual.
                await prisma.suscripcion.updateMany({
                    where: {
                        empresaId,
                        //activa: true,
                        stripeSubscriptionId: { not: stripeSubscriptionId },

                    },
                    data: {
                        activa: false,
                        canceladaEn: new Date(),
                    },
                });

                // Crear o actualizar la suscripción correspondiente a este stripeSubscriptionId
                await prisma.suscripcion.upsert({
                    where: {
                        stripeSubscriptionId,
                    },
                    create: {
                        empresaId,
                        planId,
                        fechaInicio,
                        fechaFin,
                        activa: isActiveStripeStatus(stripeStatus),
                        stripeCustomerId,
                        stripeSubscriptionId,
                        stripePriceId: stripePriceId ?? undefined,
                        stripeStatus,
                        currentPeriodEnd: fechaFin,
                    },
                    update: {
                        stripeCustomerId,
                        stripePriceId: stripePriceId ?? undefined,
                        stripeStatus,
                        currentPeriodEnd: fechaFin,
                        fechaFin,
                        activa: isActiveStripeStatus(stripeStatus),
                    },
                });

                if (stripeStatus === "canceled") {
                    // Buscar plan Gratis
                    const planGratis = await prisma.plan.findUnique({
                        where: { nombre: "Gratis" },
                    });

                    if (!planGratis) {
                        console.warn("No existe plan 'Gratis' en la tabla Plan. No se pudo hacer downgrade automático.");
                    } else {
                        // Ver si ya tiene una suscripción Gratis activa (por si acaso)
                        const yaTieneGratis = await prisma.suscripcion.findFirst({
                            where: {
                                empresaId,
                                activa: true,
                                planId: planGratis.id,
                            },
                        });

                        if (!yaTieneGratis) {
                            const ahora = new Date();
                            const fechaFinGratis = addMonths(ahora, planGratis.duracionMeses);

                            await prisma.suscripcion.create({
                                data: {
                                    empresaId,
                                    planId: planGratis.id,
                                    fechaInicio: ahora,
                                    fechaFin: fechaFinGratis,
                                    activa: true,
                                },
                            });

                            console.log(
                                `Empresa=${empresaId} downgraded automáticamente a plan Gratis después de cancelación en Stripe.`
                            );
                        }
                    }
                }

                console.log(
                    `Suscripción sincronizada desde Stripe. Empresa=${empresaId}, plan=${planId}, status=${stripeStatus}`
                );

                break;
            }

            default:
                // De momento ignoramos otros eventos
                console.log(`Evento Stripe ignorado: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Error procesando webhook de Stripe:", err);
        return NextResponse.json(
            { message: "Error interno procesando webhook" },
            { status: 500 }
        );
    }
}
