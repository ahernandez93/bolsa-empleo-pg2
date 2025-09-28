import { z } from "zod";

const urlOrPath = z.string().refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith("/"),
    "Debe ser URL http(s) o ruta que empiece con /"
);

export const experienciaSchema = z.object({
    empresa: z.string().min(1, "La empresa es requerida"),
    puesto: z.string().min(1, "El puesto es requerido"),
    fechaInicio: z.string().min(1, "Inicio requerido"),
    fechaFin: z.string().optional(),
    descripcion: z.string().optional(),
});


export const educacionSchema = z.object({
    institucion: z.string().min(1, "La institución es requerida"),
    titulo: z.string().min(1, "El título es requerido"),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
});

const generoEnum = z.enum(["MASCULINO", "FEMENINO", "OTRO"]).optional();

export const perfilCandidatoSchema = z.object({
    // avatarUrl: z.string().url().optional().or(z.literal("")),
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellido: z.string().min(2, "Mínimo 2 caracteres"),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    fechaNacimiento: z.string().optional(),
    genero: generoEnum,
    ubicacionDepartamentoId: z.number().int().optional(),
    ubicacionDepartamento: z.string().optional(),
    ubicacionCiudadId: z.number().int().optional(),
    ubicacionCiudad: z.string().optional(),
    email: z.string().email("Email inválido"),
    tituloProfesional: z.string().optional(),
    resumen: z.string().max(600, "Máx. 600 caracteres").optional(),
    disponibilidad: z.string().optional(),
    disponibilidadViajar: z.boolean().optional(),
    cambioResidencia: z.boolean().optional(),
    poseeVehiculo: z.boolean().optional(),
    cvUrl: urlOrPath.optional(),
    cvMimeType: z.string().optional(),
    cvSize: z.number().int().nonnegative().max(8 * 1024 * 1024).optional(),
    experiencia: z.array(experienciaSchema).default([]),
    educacion: z.array(educacionSchema).default([]),
    habilidades: z.array(z.string().min(1)).default([]),
});


export type PerfilCandidatoFormValues = z.infer<typeof perfilCandidatoSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Educacion = z.infer<typeof educacionSchema>;