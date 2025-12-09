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
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawCurrentPeriodEnd = (subscription as any)["current_period_end"] as number | undefined;
                const currentPeriodEnd = rawCurrentPeriodEnd != null ? new Date(rawCurrentPeriodEnd * 1000) : null;

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

                // Desactivar *todas* las suscripciones activas de esa empresa.
                // Luego el upsert vuelve a activar SOLO la del stripeSubscriptionId actual.
                await prisma.suscripcion.updateMany({
                    where: {
                        empresaId,
                        activa: true,
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
                        fechaInicio: new Date(subscription.start_date * 1000),
                        fechaFin: currentPeriodEnd ?? new Date(subscription.start_date * 1000),
                        activa: isActiveStripeStatus(stripeStatus),
                        stripeCustomerId,
                        stripeSubscriptionId,
                        stripePriceId: stripePriceId ?? undefined,
                        stripeStatus,
                        currentPeriodEnd: currentPeriodEnd ?? undefined,
                    },
                    update: {
                        stripeCustomerId,
                        stripePriceId: stripePriceId ?? undefined,
                        stripeStatus,
                        currentPeriodEnd: currentPeriodEnd ?? undefined,
                        fechaFin: currentPeriodEnd ?? undefined,
                        activa: isActiveStripeStatus(stripeStatus),
                    },
                });

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
