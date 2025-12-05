import { requireEmpresaSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const getPostulaciones = async () => {
    try {
        const { empresaId, rol } = await requireEmpresaSession();
        const isSuperAdmin = rol === "SUPER_ADMIN";

        const where = !isSuperAdmin && empresaId
            ? { oferta: { empresaId } }
            : {};

        const postulaciones = await prisma.postulacion.findMany({
            where,
            include: {
                perfil: {
                    select: {
                        id: true,
                        usuarioId: true,
                        usuario: {
                            select: {
                                persona: {
                                    select: {
                                        nombre: true,
                                        apellido: true,
                                    },
                                },
                            },
                        },
                    },
                },
                oferta: {
                    select: {
                        id: true,
                        puesto: true,
                        empresa: true,
                        modalidad: true,
                        tipoTrabajo: true,
                        ubicacionCiudad: true,
                        ubicacionDepartamento: true,
                    },
                },
            },
            orderBy: {
                fechaPostulacion: "desc",
            },
        });

        const data = postulaciones.map(postulacion => ({
            id: postulacion.id,
            perfilUsuarioNombre: postulacion.perfil.usuario.persona.nombre,
            perfilUsuarioApellido: postulacion.perfil.usuario.persona.apellido,
            ofertaPuesto: postulacion.oferta.puesto,
            ofertaUbicacionCiudad: postulacion.oferta.ubicacionCiudad?.nombre,
            ofertaUbicacionDepartamento: postulacion.oferta.ubicacionDepartamento?.nombre,
            fechaPostulacion: postulacion.fechaPostulacion.toISOString(),
            estado: postulacion.estado,
        }));

        return data;
    } catch (error) {
        console.error("Error fetching postulaciones from database:", error);
        return [];
    }
}