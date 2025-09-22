import { prisma } from "@/lib/prisma";

export async function getSuscripcionActiva(empresaId: string) {
    const now = new Date();
    return prisma.suscripcion.findFirst({
        where: {
            empresaId,
            activa: true,
            fechaFin: { gte: now },
        },
        include: { plan: true },
    });
}

export async function contarOfertasActivas(empresaId: string) {
    return prisma.ofertaLaboral.count({
        where: {
            empresaId,
            estado: { in: ["PENDIENTE", "ABIERTA"] },
        },
    });
}
