import { prisma } from "./prisma";

export async function getEmpresaActiveSubscription(empresaId: string) {
    return prisma.suscripcion.findFirst({
        where: {
            empresaId,
            activa: true,
        },
        orderBy: {
            fechaInicio: "desc",
        },
        include: {
            plan: true,
        },
    });
}
