import { OfertaLaboral, Postulacion } from "@prisma/client";

export type EmpleadoCompleto = {
    id: string
    usuarioId: string
    departamentoId: number
    cargoId: number
    createdAt: string
    updatedAt: string
    usuario: {
        id: string
        personaId: string
        email: string
        passwordHash: string
        rol: "RECLUTADOR" | "ADMIN"
        emailVerificado: boolean
        activo: boolean
        createdAt: string
        updatedAt: string
        persona: {
            id: string
            nombre: string
            apellido: string
            telefono: string
            direccion: string
            fechaNacimiento: string
            createdAt: string
            updatedAt: string
        }
    }
}

export type DepartamentoCompleto = {
    id: number
    descripcion: string
    habilitado: boolean
    createdAt: string
    updatedAt: string
}

export type CargoCompleto = {
    id: number
    descripcion: string
    habilitado: boolean
    createdAt: string
    updatedAt: string
}

export type OfertaLaboralCompleta = {
    id: string
    puesto: string
    descripcionPuesto: string
    area: string
    ubicacionPais: string
    ubicacionDepartamento: string
    ubicacionCiudad: string
    empresa: string
    nivelAcademico: string
    experienciaLaboral: number
    tipoTrabajo: string
    modalidad: string
    salario: number
    agregadoPorId: string
    estado: string
    createdAt: string
    updatedAt: string
}

export type InitialDataUpdateOfertaLaboral = Pick<OfertaLaboral, "id" | "puesto" | "descripcionPuesto" | "area" | "ubicacionPais" | "ubicacionDepartamento" | "ubicacionCiudad" | "empresa" | "nivelAcademico" | "experienciaLaboral" | "tipoTrabajo" | "modalidad" | "salario" | "estado">;

export type InitialDataUpdatePostulacion = {
    id: string
    estado: "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"
    notasInternas: string | null

    // Solo lectura para el formulario
    fechaPostulacion: string            // ISO string
    ofertaPuesto: string
    candidatoNombre: string | null
    candidatoEmail: string
}


