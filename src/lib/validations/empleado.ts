// lib/validations/empleado.ts
import { z } from 'zod';

export const empleadoSchema = z.object({
    // Datos persona
    nombre: z
        .string()
        .min(2, 'Nombre debe tener al menos 2 caracteres')
        .max(50, 'Nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nombre solo puede contener letras'),

    apellido: z
        .string()
        .min(2, 'Apellido debe tener al menos 2 caracteres')
        .max(50, 'Apellido no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Apellido solo puede contener letras'),

    telefono: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[\+]?[\d\s\-\(\)]+$/.test(val),
            'Formato de teléfono inválido'
        ),

    direccion: z
        .string()
        .max(200, 'Dirección no puede exceder 200 caracteres')
        .optional(),

    // Datos usuario
    email: z
        .string()
        .email('Email inválido')
        .toLowerCase(),

    password: z
        .string()
        .min(6, 'Contraseña debe tener al menos 6 caracteres')
        .max(100, 'Contraseña no puede exceder 100 caracteres'),

    confirmPassword: z.string(),

    // Datos empleado
    cargo: z
        .string()
        .min(2, 'Cargo debe tener al menos 2 caracteres')
        .max(100, 'Cargo no puede exceder 100 caracteres'),

    tipoEmpleado: z.enum(['RECLUTADOR', 'ADMIN_EMPRESA', 'ADMIN_SISTEMA']/* , {
        errorMap: () => ({ message: 'Tipo de empleado inválido' })
    } */),

    // Empresa
    empresaId: z.string().optional(),

    // Nueva empresa (condicional)
    esNuevaEmpresa: z.boolean().default(false),
    nombreEmpresa: z.string().optional(),
    descripcionEmpresa: z.string().optional(),
    ubicacionEmpresa: z.string().optional(),
})
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: 'Las contraseñas no coinciden',
            path: ['confirmPassword'],
        }
    )
    .refine(
        (data) => {
            // Si es admin sistema, no necesita empresa
            if (data.tipoEmpleado === 'ADMIN_SISTEMA') return true;

            // Si es nueva empresa, debe tener nombre
            if (data.esNuevaEmpresa) {
                return data.nombreEmpresa && data.nombreEmpresa.trim().length > 0;
            }

            // Si es empresa existente, debe seleccionar una
            return data.empresaId && data.empresaId.length > 0;
        },
        {
            message: 'Debe proporcionar información de la empresa',
            path: ['empresaId'],
        }
    );

export type EmpleadoFormData = z.infer<typeof empleadoSchema>;