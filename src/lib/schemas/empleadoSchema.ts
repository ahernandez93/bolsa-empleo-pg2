import { z } from "zod";

export const empleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  apellido: z.string().min(2, "El apellido es requerido"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["RECLUTADOR", "ADMIN"]/* , {
    errorMap: () => ({ message: "Selecciona un rol válido" }),
  } */),
  departamento: z.string().min(2, "El departamento es requerido"),
  cargo: z.string().min(2, "El cargo es requerido"),
});

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;