import { z } from "zod";


export const experienciaSchema = z.object({
    company: z.string().min(1, "La empresa es requerida"),
    role: z.string().min(1, "El puesto es requerido"),
    startDate: z.string().min(1, "Inicio requerido"),
    endDate: z.string().optional(),
    description: z.string().optional(),
});


export const educacionSchema = z.object({
    institution: z.string().min(1, "La institución es requerida"),
    degree: z.string().min(1, "El título es requerido"),
    graduationYear: z.string().optional(),
    location: z.string().optional(),
});


export const perfilCandidatoSchema = z.object({
    avatarUrl: z.string().url().optional().or(z.literal("")),
    firstName: z.string().min(2, "Mínimo 2 caracteres"),
    lastName: z.string().min(2, "Mínimo 2 caracteres"),
    headline: z.string().optional(), // Desarrollador Full‑Stack, etc.
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    location: z.string().optional(),
    summary: z.string().max(600, "Máx. 600 caracteres").optional(),
    experience: z.array(experienciaSchema).default([]),
    education: z.array(educacionSchema).default([]),
    skills: z.array(z.string().min(1)).default([]),
});


export type PerfilCandidatoFormValues = z.infer<typeof perfilCandidatoSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Educacion = z.infer<typeof educacionSchema>;