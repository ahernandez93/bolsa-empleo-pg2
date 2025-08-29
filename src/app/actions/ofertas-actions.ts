import { prisma } from "@/lib/prisma";

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
            },

        });
        const data = ofertasLaborales.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionPais: ofertaLaboral.ubicacionPais,
            ubicacionDepartamento: ofertaLaboral.ubicacionDepartamento,
            ubicacionCiudad: ofertaLaboral.ubicacionCiudad,
            empresa: ofertaLaboral.empresa,
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

export const getOFertasLaboralesAbiertas = async () => {
    try {
        const ofertasLaboralesAbiertas = await prisma.ofertaLaboral.findMany({
            where: {
                estado: "ABIERTA",
            },
            orderBy: {
                fechaCreacion: "desc",
            },
        });
        const data = ofertasLaboralesAbiertas.map(ofertaLaboral => ({
            id: ofertaLaboral.id,
            puesto: ofertaLaboral.puesto,
            descripcionPuesto: ofertaLaboral.descripcionPuesto,
            area: ofertaLaboral.area,
            ubicacionPais: ofertaLaboral.ubicacionPais,
            ubicacionDepartamento: ofertaLaboral.ubicacionDepartamento,
            ubicacionCiudad: ofertaLaboral.ubicacionCiudad,
            empresa: ofertaLaboral.empresa,
            nivelAcademico: ofertaLaboral.nivelAcademico,
            experienciaLaboral: ofertaLaboral.experienciaLaboral,
            tipoTrabajo: ofertaLaboral.tipoTrabajo,
            modalidad: ofertaLaboral.modalidad,
            fechaCreacion: ofertaLaboral.fechaCreacion,
        }));

        return data;

    } catch (error) {
        console.error("Error fetching ofertas laborales abiertas from database:", error);
        return [];
    }
}