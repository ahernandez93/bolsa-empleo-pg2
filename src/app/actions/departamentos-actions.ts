import { prisma } from "@/lib/prisma";


export interface DepartamentoItem {
    id: number;
    descripcion: string;
}

export const getDepartamentos = async (): Promise<DepartamentoItem[]> => {
    try {
        const departamentos = await prisma.departamento.findMany({
            where: { habilitado: true },
            select: { id: true, descripcion: true },
            orderBy: { descripcion: "asc" }
        });

        return departamentos;
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        return [];
    }
}