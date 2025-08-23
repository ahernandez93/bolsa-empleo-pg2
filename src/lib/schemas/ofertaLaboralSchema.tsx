import z from "zod";

const TipoTrabajoEnum = z.enum(["PERMANENTE", "TEMPORAL"]);
const ModalidadEnum = z.enum(["PRESENCIAL", "REMOTO", "HIBRIDO"]);
const EstadoOfertaEnum = z.enum(["PENDIENTE", "ABIERTA", "RECHAZADA", "CERRADA"]);

export const ofertaLaboralSchema = z.object({
    puesto: z.string().min(3, "El puesto debe tener al menos 3 caracteres"),
    descripcionPuesto: z.string().min(10, "La descripción debe ser más detallada"),
    area: z.string().min(2, "El área es obligatoria"),
    ubicacionPais: z.string().min(2, "El país es obligatorio"),
    ubicacionDepartamento: z.string().optional(),
    ubicacionCiudad: z.string().optional(),
    empresa: z.string().min(2, "El nombre de la empresa es obligatorio"),
    nivelAcademico: z.string().optional(),
    experienciaLaboral: z.string().optional(),
    habilidadesIds: z.array(z.string().uuid()).optional(),
    tipoTrabajo: TipoTrabajoEnum,
    modalidad: ModalidadEnum,
    salario: z.number().nonnegative().optional(),
    reclutadorId: z.string().uuid({ message: "ID de reclutador inválido" }).optional(),
    agregadoPorId: z.string().uuid().optional(),
    actualizadoPorId: z.string().uuid().optional(),
    aprobadoPorId: z.string().uuid().optional(),
    estado: EstadoOfertaEnum,
});

export type OfertaLaboralFormData = z.infer<typeof ofertaLaboralSchema>;

