import z from "zod";

const TipoTrabajoEnum = z.enum(["PERMANENTE", "TEMPORAL"]);
const ModalidadEnum = z.enum(["PRESENCIAL", "REMOTO", "HIBRIDO"]);
export const EstadoOfertaEnum = z.enum(["PENDIENTE", "ABIERTA", "RECHAZADA", "CERRADA"]);

const IdInt = z.coerce.number().int().positive();
export const ofertaLaboralFormSchema = z.object({
    puesto: z.string().min(3, "El puesto debe tener al menos 3 caracteres"),
    descripcionPuesto: z.string().min(10, "La descripción debe ser más detallada"),
    area: z.string().min(2, "El área es obligatoria"),
    ubicacionDepartamentoId: IdInt,
    ubicacionCiudadId: IdInt,
    empresa: z.string().min(2, "El nombre de la empresa es obligatorio"),
    nivelAcademico: z.string().min(1, "El nivel académico es obligatorio"),
    experienciaLaboral: z.string().min(1, "La experiencia laboral es obligatoria"),
    // habilidadesIds: z.array(z.string().uuid()).optional(),
    tipoTrabajo: TipoTrabajoEnum,
    modalidad: ModalidadEnum,
    salario: z.coerce.number().nonnegative("Ingrese un salario válido"),
    /* reclutadorId: z.string().uuid({ message: "ID de reclutador inválido" }).optional(),
    agregadoPorId: z.string().uuid(),
    actualizadoPorId: z.string().uuid().optional(),
    aprobadoPorId: z.string().uuid().optional(),
    estado: EstadoOfertaEnum, */
});

// Extendemos con lo que SOLO el server define
export const ofertaLaboralServerSchema = ofertaLaboralFormSchema.extend({
    agregadoPorId: z.string().uuid(),
    estado: EstadoOfertaEnum.default("PENDIENTE"),
});

export const ofertaLaboralUpdateSchema = ofertaLaboralFormSchema.extend({
    estado: EstadoOfertaEnum,
});

export type OfertaLaboralFormData = z.infer<typeof ofertaLaboralFormSchema>;
export type OfertaLaboralUpdateData = z.infer<typeof ofertaLaboralUpdateSchema>;


