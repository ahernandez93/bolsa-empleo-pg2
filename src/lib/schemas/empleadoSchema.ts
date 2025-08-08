import { z } from "zod";

const schemaBase = {
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  email: z.string().email("Email inválido"),
  rol: z.enum(["RECLUTADOR", "ADMIN"]),
  departamento: z.string().min(2, "El departamento es requerido"),
  cargo: z.string().min(2, "El cargo es requerido"),
}

export const empleadoSchema = z.object({
  ...schemaBase,
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const empleadoUpdateSchema = z.object({
  ...schemaBase,
  password: z.string().optional(),
})

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;
export type EmpleadoUpdateData = z.infer<typeof empleadoUpdateSchema>;