import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";

export type PerfilApiResponse = {
    id: string;
    usuarioId: string;
    resumen: string | null;
    tituloProfesional: string | null;
    disponibilidad: string | null;
    disponibilidadViajar: boolean;
    cambioResidencia: boolean;
    poseeVehiculo: boolean;
    cvUrl: string | null;
    cvKey: string | null;
    cvMimeType: string | null;
    cvSize: number | null;
    fechaCreacion: string;
    fechaActualizacion: string;
    usuario: {
        id: string;
        personaId: string;
        email: string;
        rol: "ADMIN" | "RECLUTADOR" | "CANDIDATO";
        emailVerificado: boolean;
        activo: boolean;
        empresaId: string | null;
        createdAt: string;
        updatedAt: string;
        persona: {
            id: string;
            nombre: string;
            apellido: string;
            telefono: string | null;
            direccion: string | null;
            fechaNacimiento: string | null;
            genero: "MASCULINO" | "FEMENINO" | "OTRO" | null;
            ubicacionDepartamentoId: number | null;
            ubicacionCiudadId: number | null;
            createdAt: string;
            updatedAt: string;
            ubicacionDepartamento: { id: number; nombre: string } | null;
            ubicacionCiudad: { id: number; nombre: string } | null;
        };
    };
    habilidades: { habilidad: { id: number; nombre: string } }[];
    educacion: {
        institucion: string;
        titulo: string;
        nivelAcademico?: string | null;
        fechaInicio: string | null;
        fechaFin: string | null;
    }[];
    experiencia: {
        empresa: string;
        puesto: string;
        descripcion: string | null;
        fechaInicio: string;
        fechaFin: string | null;
        actualmenteTrabajando?: boolean;
    }[];
};

const toYmd = (s?: string | null) => (s ? new Date(s).toISOString().slice(0, 10) : undefined);

export function mapPerfilToFormValues(api: PerfilApiResponse): PerfilCandidatoFormValues {
    const p = api.usuario.persona;

    return {
        // Persona + Usuario (PLANO)
        nombre: p.nombre,
        apellido: p.apellido,
        email: api.usuario.email,
        telefono: p.telefono ?? undefined,
        direccion: p.direccion ?? undefined,
        fechaNacimiento: toYmd(p.fechaNacimiento),
        genero: p.genero ?? undefined,
        ubicacionDepartamentoId: p.ubicacionDepartamentoId ?? undefined,
        ubicacionDepartamento: p.ubicacionDepartamento?.nombre ?? undefined,
        ubicacionCiudadId: p.ubicacionCiudadId ?? undefined,
        ubicacionCiudad: p.ubicacionCiudad?.nombre ?? undefined,

        // PerfilCandidato
        tituloProfesional: api.tituloProfesional ?? undefined,
        resumen: api.resumen ?? undefined,
        disponibilidad: api.disponibilidad ?? undefined,
        disponibilidadViajar: api.disponibilidadViajar,
        cambioResidencia: api.cambioResidencia,
        poseeVehiculo: api.poseeVehiculo,

        // CV
        cvUrl: api.cvUrl ?? undefined,
        cvMimeType: api.cvMimeType ?? undefined,
        cvSize: api.cvSize ?? undefined,

        // Colecciones
        experiencia: (api.experiencia ?? []).map((e) => ({
            empresa: e.empresa,
            puesto: e.puesto,
            fechaInicio: toYmd(e.fechaInicio)!,      // requerido
            fechaFin: toYmd(e.fechaFin),
            descripcion: e.descripcion ?? undefined,
        })),
        educacion: (api.educacion ?? []).map((ed) => ({
            institucion: ed.institucion,
            titulo: ed.titulo,
            fechaInicio: toYmd(ed.fechaInicio),
            fechaFin: toYmd(ed.fechaFin),
        })),
        habilidades: (api.habilidades ?? []).map((h) => h.habilidad.nombre),
    };
}