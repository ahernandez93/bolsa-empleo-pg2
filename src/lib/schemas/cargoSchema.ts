import { z } from "zod";

export const cargoSchema = z.object({
    descripcion: z.string().min(1, "La descripción es requerida").min(2, "La descripción debe tener al menos 2 caracteres"),
    habilitado: z.boolean().default(true),
});

export type CargoFormData = z.infer<typeof cargoSchema>;
