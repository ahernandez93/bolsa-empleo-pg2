import { prisma } from "@/lib/prisma";


export const getCandidatos = async () => {
    try {
        const candidatos = await prisma.perfilCandidato.findMany({
            include: {
                usuario: {
                    include: {
                        persona: {
                            include: {
                                ubicacionDepartamento: true,
                                ubicacionCiudad: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                usuario: {
                    persona: {
                        createdAt: "desc",
                    },
                },
            },
        });
        const data = candidatos.map(emp => ({
            id: emp.id,
            nombre: emp.usuario.persona.nombre,
            apellido: emp.usuario.persona.apellido,
            email: emp.usuario.email,
            direccion: emp.usuario.persona.direccion,
            telefono: emp.usuario.persona.telefono,
            ubicacionDepartamento: emp.usuario.persona.ubicacionDepartamento?.nombre ?? "",
            ubicacionCiudad: emp.usuario.persona.ubicacionCiudad?.nombre ?? "",
            createdAt: emp.usuario.persona.createdAt.toISOString(),
        }));

        return data;

    } catch (error) {
        console.error("Error fetching candidatos from database:", error);
        return [];
    }
}