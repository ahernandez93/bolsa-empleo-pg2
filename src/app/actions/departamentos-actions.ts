import { prisma } from "@/lib/prisma";
import { DepartamentoData } from "../(admin)/admin/departamentos/components/ListDepartamentos/columns";


export interface DepartamentoItem {
    id: number;
    descripcion: string;
}

export const getDepartamentos = async (): Promise<DepartamentoData[]> => {
    try {
        const departamentos = await prisma.departamento.findMany({
            select: {
                id: true,
                descripcion: true,
                habilitado: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { descripcion: "asc" }
        });

        const data = departamentos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
            habilitado: emp.habilitado,
            createdAt: emp.createdAt.toISOString(),
            updatedAt: emp.updatedAt.toISOString(),
        }))

        return data;
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        return [];
    }
}

export const getDepartamentosHabilitados = async (): Promise<DepartamentoItem[]> => {
    try {
        const departamentos = await prisma.departamento.findMany({
            where: { habilitado: true },
            select: {
                id: true,
                descripcion: true,
            },
            orderBy: { descripcion: "asc" }
        });

        const data = departamentos.map(emp => ({
            id: emp.id,
            descripcion: emp.descripcion,
        }))

        return data;
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        return [];
    }
}
