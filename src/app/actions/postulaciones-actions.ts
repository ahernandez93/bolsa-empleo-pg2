import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export const getPostulaciones = async () => {
    try {

        const postulaciones = await prisma.postulacion.findMany({
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
        });

        const data = postulaciones.map(postulacion => ({
            id: postulacion.id,
            perfilUsuarioNombre: postulacion.perfil.usuario.persona.nombre,
            perfilUsuarioApellido: postulacion.perfil.usuario.persona.apellido,
            ofertaPuesto: postulacion.oferta.puesto,
            ofertaUbicacionCiudad: postulacion.oferta.ubicacionCiudad,
            ofertaUbicacionDepartamento: postulacion.oferta.ubicacionDepartamento,
            fechaPostulacion: postulacion.fechaPostulacion.toISOString(),
            estado: postulacion.estado,
        }));

        return data;
    } catch (error) {
        console.error("Error fetching postulaciones from database:", error);
        return [];
    }
}