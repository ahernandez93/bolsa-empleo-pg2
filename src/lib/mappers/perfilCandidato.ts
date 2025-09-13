import type { PerfilCandidatoFormValues } from "@/lib/schemas/perfilCandidatoSchema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPerfilToFormValues(perfil: any): PerfilCandidatoFormValues {
    const persona = perfil?.usuario?.persona;

    /* const location = [
        persona?.ubicacionCiudad?.nombre,
        persona?.ubicacionDepartamento?.nombre,
        // si quieres país, agréguenlo cuando lo modelen
    ].filter(Boolean).join(", "); */

    return {
        nombre: persona?.nombre ?? "",
        apellido: persona?.apellido ?? "",
        tituloProfesional: perfil?.tituloProfesional ?? "",
        email: perfil?.usuario?.email ?? "",
        telefono: persona?.telefono ?? "",
        ubicacionDepartamentoId: persona?.ubicacionDepartamentoId ?? undefined,
        ubicacionDepartamento: persona?.ubicacionDepartamento?.nombre ?? "",
        ubicacionCiudadId: persona?.ubicacionCiudadId ?? undefined,
        ubicacionCiudad: persona?.ubicacionCiudad?.nombre ?? "",
        resumen: perfil?.resumen ?? "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        experiencia: (perfil?.experiencia ?? []).map((exp: any) => ({
            empresa: exp.empresa,
            puesto: exp.puesto,
            fechaInicio: exp.fechaInicio ? String(new Date(exp.fechaInicio).getFullYear()) : "",
            fechaFin: exp.actualmenteTrabajando
                ? "Presente"
                : exp.fechaFin
                    ? String(new Date(exp.fechaFin).getFullYear())
                    : "",
            descripcion: exp.descripcion ?? "",
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        educacion: (perfil?.educacion ?? []).map((ed: any) => ({
            institucion: ed.institucion,
            titulo: ed.titulo,
            fechaFin: ed.fechaFin ? String(new Date(ed.fechaFin).getFullYear()) : "",
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        habilidades: (perfil?.habilidades ?? []).map((h: any) => h.habilidad?.nombre).filter(Boolean),
    };
}
