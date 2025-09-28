import { z } from "zod";

export const empleadoPerfilSchema = z.object({
    nombre: z.string().min(2, "Nombre demasiado corto"),
    apellido: z.string().min(2, "Apellido demasiado corto"),
    telefono: z.string().min(7, "Teléfono inválido").optional().or(z.literal("")),
    direccion: z.string().max(200).optional().or(z.literal("")),
    fechaNacimiento: z
        .string()
        .optional()
        .or(z.literal(""))
        /* .transform((v) => (v ? new Date(v) : undefined)) */,
    genero: z.enum(["MASCULINO", "FEMENINO"]).optional().or(z.literal("")),
    ubicacionDepartamentoId: z.number().int().optional(),
    ubicacionCiudadId: z.number().int().optional(),
});

export type EmpleadoPerfilInput = z.infer<typeof empleadoPerfilSchema>;