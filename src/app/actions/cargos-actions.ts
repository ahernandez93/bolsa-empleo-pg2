import { prisma } from "@/lib/prisma";


export interface CargoItem {
    id: number;
    descripcion: string;
}

export const getCargos = async (): Promise<CargoItem[]> => {
    try {
        const cargos = await prisma.cargo.findMany({
            where: { habilitado: true },
            select: { id: true, descripcion: true },
            orderBy: { descripcion: "asc" }
        });

        return cargos;
    } catch (error) {
        console.error("Error al obtener cargos:", error);
        return [];
    }
}