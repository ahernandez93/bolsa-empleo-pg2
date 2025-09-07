import z from "zod";

export const EstadoPostulacionEnum = z.enum(["SOLICITUD", "ENTREVISTA", "EVALUACIONES", "CONTRATACION", "RECHAZADA"]);

export const postulacionFormSchema = z.object({
    estado: EstadoPostulacionEnum,
    notasInternas: z.string().max(2000, "Máximo 2000 caracteres").optional().nullable(),
});

export type PostulacionFormData = z.infer<typeof postulacionFormSchema>;

