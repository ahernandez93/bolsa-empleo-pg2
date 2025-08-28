import { prisma } from "@/lib/prisma";
import { CargoData } from "../(admin)/admin/cargos/components/ListCargos/columns";

export interface CargoItem {
    id: number;
    descripcion: string;
}

export const getCargos = async (): Promise<CargoData[]> => {
    try {
        const cargos = await prisma.cargo.findMany({
            select: {
                id: true,
                descripcion: true,
                habilitado: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { descripcion: "asc" }
        });

        const data = cargos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
            habilitado: emp.habilitado,
            createdAt: emp.createdAt.toISOString(),
            updatedAt: emp.updatedAt.toISOString(),
        }))

        return data;
    } catch (error) {
        console.error("Error al obtener cargos:", error);
        return [];
    }
}

export const getCargosHabilitados = async (): Promise<CargoItem[]> => {
    try {
        const cargos = await prisma.cargo.findMany({
            where: { habilitado: true },
            select: {
                id: true,
                descripcion: true,
            },
            orderBy: { descripcion: "asc" }
        });

        const data = cargos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
        }))

        return data;
    } catch (error) {
        console.error("Error al obtener cargos:", error);
        return [];
    }
}
