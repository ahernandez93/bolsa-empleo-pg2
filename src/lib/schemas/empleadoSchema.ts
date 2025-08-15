import { z } from "zod";

const ROLES = ["RECLUTADOR", "ADMIN"] as const;

const schemaBase = {
  nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(1, "El apellido es requerido").min(2, "El apellido debe tener al menos 2 caracteres"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  rol: z.string().min(1, "El rol es requerido").refine((v) => (ROLES as readonly string[]).includes(v), { message: "Rol inválido" }),
  departamentoId: z.number().min(1, "El departamento es requerido").min(2, "El departamento debe tener al menos 2 caracteres"),
  cargoId: z.number().min(1, "El cargo es requerido").min(2, "El cargo debe tener al menos 2 caracteres"),
  activo: z.boolean().optional(),
};

export const empleadoSchema = z.object({
  ...schemaBase,
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const empleadoUpdateSchema = z.object({
  ...schemaBase,
  password: z.string().optional(),
});

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;
export type EmpleadoUpdateData = z.infer<typeof empleadoUpdateSchema>;