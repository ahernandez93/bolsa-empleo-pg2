import { z } from "zod";

export const empresaConfigSchema = z.object({
    nombre: z.string().min(2, "Nombre demasiado corto"),
    rtn: z.string().max(50).optional().or(z.literal("")),
    sitioWeb: z
        .string()
        .url("URL inválida")
        .optional()
        .or(z.literal("")),
    telefono: z.string().min(7, "Teléfono inválido").optional().or(z.literal("")),
    descripcion: z.string().max(1000).optional().or(z.literal("")),
    ubicacionDepartamentoId: z.number().int().optional(),
    ubicacionCiudadId: z.number().int().optional(),
    activa: z.boolean().optional(),
});

export type EmpresaConfigInput = z.infer<typeof empresaConfigSchema>;
