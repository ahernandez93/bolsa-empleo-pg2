import { requireEmpresaSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export const getPostulaciones = async () => {
    try {
        const { session, empresaId, rol } = await requireEmpresaSession();

        const userId = session?.user?.id;
        const isSuperAdmin = rol === "SUPERADMIN";
        const isRecruiter = rol === "RECLUTADOR";

        let where: Prisma.PostulacionWhereInput = {};

        if (!isSuperAdmin && empresaId) {
            if (isRecruiter) {
                // RECLUTADOR:
                // Solo postulaciones a ofertas de su empresa
                // que él creó o que le asignaron
                where = {
                    oferta: {
                        empresaId,
                        OR: [
                            { agregadoPorId: userId },
                            { reclutadorId: userId },
                        ],
                    },
                };
            } else {
                // ADMIN:
                // todas las postulaciones de las ofertas de su empresa
                where = {
                    oferta: {
                        empresaId,
                    },
                };
            }
        }

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
                historialCambios: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        estadoNuevo: true,
                        createdAt: true,
                        notasInternas: true,
                    },
                },
            },
            orderBy: {
                fechaPostulacion: "desc",
            },
        });

        const data = postulaciones.map(postulacion => {
            const ultimoCambio = postulacion.historialCambios[0];
            return {
                id: postulacion.id,
                perfilUsuarioNombre: postulacion.perfil.usuario.persona.nombre,
                perfilUsuarioApellido: postulacion.perfil.usuario.persona.apellido,
                ofertaPuesto: postulacion.oferta.puesto,
                ofertaUbicacionCiudad: postulacion.oferta.ubicacionCiudad?.nombre,
                ofertaUbicacionDepartamento: postulacion.oferta.ubicacionDepartamento?.nombre,
                fechaPostulacion: postulacion.fechaPostulacion.toISOString(),
                estado: postulacion.estado,
                ultimoCambioEstado: ultimoCambio?.estadoNuevo ?? postulacion.estado,
                ultimoCambioFecha: (ultimoCambio?.createdAt ?? postulacion.fechaActualizacion).toISOString(),
                ultimoCambioNotas: ultimoCambio?.notasInternas ?? null,
            };
        });

        return data;

    } catch (error) {
        console.error("Error fetching postulaciones from database:", error);
        return [];
    }
}