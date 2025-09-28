import { OfertaLaboral } from "@prisma/client";

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

export type InitialDataUpdateOfertaLaboral = Pick<OfertaLaboral, "id" | "puesto" | "descripcionPuesto" | "area" | "ubicacionDepartamentoId" | "ubicacionCiudadId" | "empresaId" | "nivelAcademico" | "experienciaLaboral" | "tipoTrabajo" | "modalidad" | "salario" | "estado">;

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

export type RolUsuario = "ADMIN" | "RECLUTADOR" | "SUPERADMIN";

export type Genero = "MASCULINO" | "FEMENINO" | ""; // "" cuando el form no tiene selección

export type EmpresaLite = {
    id: string;
    nombre: string;
};

export type EmpleadoPerfilDTO = {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;                       // cadena para form
    direccion: string;
    fechaNacimiento: string;                // YYYY-MM-DD o ""
    genero: Genero;
    ubicacionDepartamentoId?: number;
    ubicacionCiudadId?: number;
    email: string;
    empresa: EmpresaLite | null;
    role: RolUsuario;
};

export type ApiErrorResponse = { message: string };

export type EmpresaPlanLite = {
    id: string;
    nombre: "Gratis" | "Básico" | "Premium" | string;
    maxOfertasActivas: number;
    incluyeDestacado: boolean;
    vence: string;
};

export type EmpresaConfigDTO = {
    id: string;
    nombre: string;
    rtn: string;
    sitioWeb: string;
    telefono: string;
    descripcion: string;
    ubicacionDepartamentoId?: number;
    ubicacionCiudadId?: number;
    activa: boolean;
    plan: EmpresaPlanLite | null;
};


