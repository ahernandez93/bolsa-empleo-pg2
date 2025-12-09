// Server component: trae planes y suscripción vigente para resaltar el actual
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import PlanesClient from "./planes-client";

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
    const session = await auth();
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session?.user as any)?.role as string | undefined;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empresaId = (session?.user as any)?.empresaId as string | null;

    if (!session?.user?.id) redirect("/admin/login");
    if (role !== "ADMIN" && role !== "SUPERADMIN") redirect("/admin");

    const [planes, susActiva] = await Promise.all([
        prisma.plan.findMany({
            orderBy: { precioMensual: "asc" },
            select: { id: true, nombre: true, descripcion: true, precioMensual: true, duracionMeses: true, maxOfertasActivas: true, incluyeDestacado: true },
        }),
        empresaId ? prisma.suscripcion.findFirst({
            where: { empresaId, activa: true },
            include: { plan: { select: { nombre: true } } },
        }) : null,
    ]);

    const actual = susActiva?.plan?.nombre ?? null;

    const effectiveStatus =
        (susActiva?.stripeStatus as string | null) ??
        (susActiva ? (susActiva.activa ? "active" : "canceled") : null);

    const effectiveEndDate: Date | null =
        (susActiva?.currentPeriodEnd as Date | null) ??
        (susActiva?.fechaFin as Date | null) ??
        null;

    const suscripcionInfo = susActiva
        ? {
            status: effectiveStatus,
            fechaFin: effectiveEndDate ? effectiveEndDate.toISOString() : null,
            canceladaEn: susActiva.canceladaEn
                ? susActiva.canceladaEn.toISOString()
                : null,
            esDePago: !!susActiva.stripeSubscriptionId,
        }
        : null;

    return (
        <div className="flex flex-col gap-4 p-4 pt-0">
            <PlanesClient
                planes={planes}
                actual={actual}
                suscripcionInfo={suscripcionInfo}
            />
        </div>
    );
}
