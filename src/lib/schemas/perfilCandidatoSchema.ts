import { z } from "zod";


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


export const perfilCandidatoSchema = z.object({
    // avatarUrl: z.string().url().optional().or(z.literal("")),
    nombre: z.string().min(2, "Mínimo 2 caracteres"),
    apellido: z.string().min(2, "Mínimo 2 caracteres"),
    tituloProfesional: z.string().optional(), // Desarrollador Full‑Stack, etc.
    email: z.string().email("Email inválido"),
    telefono: z.string().optional(),
    ubicacionDepartamentoId: z.number().int().optional(), 
    ubicacionDepartamento: z.string().optional(),
    ubicacionCiudadId: z.number().int().optional(),
    ubicacionCiudad: z.string().optional(),
    resumen: z.string().max(600, "Máx. 600 caracteres").optional(),
    experiencia: z.array(experienciaSchema).default([]),
    educacion: z.array(educacionSchema).default([]),
    habilidades: z.array(z.string().min(1)).default([]),
});


export type PerfilCandidatoFormValues = z.infer<typeof perfilCandidatoSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Educacion = z.infer<typeof educacionSchema>;