import { z } from "zod";

export const departamentoSchema = z.object({
  descripcion: z.string().min(1, "La descripción es requerida").min(2, "La descripción debe tener al menos 2 caracteres"),
  habilitado: z.boolean().optional().default(true),
});

export type DepartamentoFormData = z.infer<typeof departamentoSchema>;
