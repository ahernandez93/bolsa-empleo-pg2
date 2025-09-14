import { z } from "zod";

export const toggleSaveSchema = z.object({
    ofertaId: z.string().min(1, "Oferta requerida"),
});

export type ToggleSaveInput = z.infer<typeof toggleSaveSchema>;