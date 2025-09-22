import { z } from "zod"

export const registroEmpresaSchema = z.object({
    usuario: z.object({
        nombre: z.string().min(2, "Nombre requerido"),
        apellido: z.string().min(2, "Apellido requerido"),
        email: z.string().email("Correo inválido"),
        password: z.string().min(6, "Mínimo 6 caracteres"),
    }),
    empresa: z.object({
        nombre: z.string().min(2, "Nombre de empresa requerido"),
        telefono: z.string().optional(),
        sitioWeb: z.string().url("URL inválida").optional(),
        descripcion: z.string().max(500, "Máx 500 caracteres").optional(),
        ubicacionDepartamentoId: z.number().int().optional(),
        ubicacionCiudadId: z.number().int().optional(),
    }),
    planNombre: z.enum(["Gratis", "Básico", "Premium"]).optional().default("Gratis"),
})

export type RegistroEmpresaValues = z.input<typeof registroEmpresaSchema>

