import { prisma } from "@/lib/prisma";
import type { JobCardProps } from "@/components/jobcarousel";

export const dynamic = 'force-dynamic';

export const getOfertasLaborales = async () => {
    try {
        const ofertasLaborales = await prisma.ofertaLaboral.findMany({
            include: {
                agregadoPor: {
                    include: {
                        persona: true,
                    },
                },
                ubicacionDepartamento: true,
                ubicacionCiudad: true,
                empresa: true,
            },

        });
        const data = ofertasLaborales.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionDepartamentoId: ofertaLaboral.ubicacionDepartamentoId,
            ubicacionDepartamentoDescripcion: ofertaLaboral.ubicacionDepartamento?.nombre,
            ubicacionCiudadId: ofertaLaboral.ubicacionCiudadId,
            ubicacionCiudadDescripcion: ofertaLaboral.ubicacionCiudad?.nombre,
            empresaId: ofertaLaboral.empresaId,
            empresaNombre: ofertaLaboral.empresa?.nombre,
            nivelAcademico: ofertaLaboral.nivelAcademico,
            experienciaLaboral: ofertaLaboral.experienciaLaboral,
            tipoTrabajo: ofertaLaboral.tipoTrabajo,
            modalidad: ofertaLaboral.modalidad,
            salario: ofertaLaboral.salario,
            estado: ofertaLaboral.estado,
            agregadoPorId: ofertaLaboral.agregadoPorId,
            agregadoPorUsuario: ofertaLaboral.agregadoPor?.persona.nombre,
        }));

        return data;

    } catch (error) {
        console.error("Error fetching ofertas laborales from database:", error);
        return [];
    }
}

export const getOFertasLaboralesAbiertas = async (userId?: string): Promise<JobCardProps[]> => {
    try {
        const ofertasLaboralesAbiertas = await prisma.ofertaLaboral.findMany({
            where: {
                estado: "ABIERTA",
            },
            orderBy: {
                fechaCreacion: "desc",
            },
            include: {
                ubicacionDepartamento: { select: { nombre: true } },
                ubicacionCiudad: { select: { nombre: true } },
                empresa: { select: { nombre: true } },
                guardados: userId
                    ? {
                        where: {
                            userId,
                        },
                        select: {
                            userId: true,
                        },
                    }
                    : {},
            },
        });
        const data: JobCardProps[] = ofertasLaboralesAbiertas.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionDepartamentoId: ofertaLaboral.ubicacionDepartamentoId,
            ubicacionDepartamentoDescripcion: ofertaLaboral.ubicacionDepartamento?.nombre,
            ubicacionCiudadId: ofertaLaboral.ubicacionCiudadId,
            ubicacionCiudadDescripcion: ofertaLaboral.ubicacionCiudad?.nombre,
            empresaId: ofertaLaboral.empresaId,
            empresa: ofertaLaboral.empresa?.nombre ?? "—",
            nivelAcademico: ofertaLaboral.nivelAcademico,
            experienciaLaboral: ofertaLaboral.experienciaLaboral,
            tipoTrabajo: ofertaLaboral.tipoTrabajo,
            modalidad: ofertaLaboral.modalidad,
            fechaCreacion: ofertaLaboral.fechaCreacion,
            isSaved: Array.isArray(ofertaLaboral.guardados) ? ofertaLaboral.guardados.length > 0 : false,
            guardados: undefined,
        }));

        return data;

    } catch (error) {
        console.error("Error fetching ofertas laborales abiertas from database:", error);
        return [];
    }
}