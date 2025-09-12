'use server'

import { signIn } from '@/lib/auth/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const LoginAction = async (email: string, password: string) => {
    try {
        const res = await signIn('credentials', {
            email,
            password,
            redirect: false
        });
        console.log("SignIn result:", res);

        if (res?.error) {
            return { success: false, error: res.error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error("Login error:", error);

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { success: false, error: "Credenciales inválidas" };
                case 'CallbackRouteError':
                    return { success: false, error: error.cause?.err?.message || "Error en el callback de autenticación" };
                default:
                    return { success: false, error: error.message || "Error de autenticación" };
            }
        }

        if (error instanceof Error) {
            return { success: false, error: error.message };
        }

        return { success: false, error: "Error desconocido al iniciar sesión" };
    }
}

// Acción específica para CANDIDATO: valida rol antes de autenticar
export const LoginActionCandidate = async (email: string, password: string) => {
    try {
        // Verificar rol antes de crear sesión
        const user = await prisma.usuario.findUnique({
            where: { email },
            select: { rol: true, activo: true }
        });

        if (user && user.activo === true && user.rol !== 'CANDIDATO') {
            return { success: false, error: 'Usuario no autorizado para acceso de candidato' };
        }

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false
        });

        if (res?.error) {
            return { success: false, error: res.error };
        }

        return { success: true, error: null };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { success: false, error: 'Credenciales inválidas' };
                case 'CallbackRouteError':
                    return { success: false, error: error.cause?.err?.message || 'Error en el callback de autenticación' };
                default:
                    return { success: false, error: error.message || 'Error de autenticación' };
            }
        }
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Error desconocido al iniciar sesión' };
    }
}

// Registro de candidato
const registerSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido'),
    apellido: z.string().min(1, 'Apellido requerido'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
});

export type RegisterCandidateInput = z.infer<typeof registerSchema>;

export const RegisterCandidateAction = async (input: RegisterCandidateInput) => {
    try {
        const data = registerSchema.parse(input);
        const email = data.email.trim().toLowerCase();

        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: 'El correo ya está registrado' } as const;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const [persona, usuario, perfil] = await prisma.$transaction(async (tx) => {
            const persona = await tx.persona.create({
                data: {
                    nombre: data.nombre.trim(),
                    apellido: data.apellido.trim(),
                },
            });

            const usuario = await tx.usuario.create({
                data: {
                    personaId: persona.id,
                    email,
                    passwordHash,
                    rol: "CANDIDATO",
                    emailVerificado: true,
                    activo: true,
                },
            });

            const perfil = await tx.perfilCandidato.create({
                data: {
                    usuarioId: usuario.id,
                    resumen: null,
                    tituloProfesional: null,
                    disponibilidad: "INMEDIATA",
                    cvUrl: null,
                    cvKey: null,
                    cvMimeType: null,
                    cvSize: null,
                },
            });

            return [persona, usuario, perfil] as const;
        });

        return { 
            success: true, 
            error: null,
            // útil si quieres redirigir o cachear
            ids: { personaId: persona.id, usuarioId: usuario.id, perfilId: perfil.id },
        } as const;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues?.[0]?.message ?? 'Datos inválidos' } as const;
        }
        if (error instanceof Error) {
            return { success: false, error: error.message } as const;
        }
        return { success: false, error: 'Error desconocido al registrar' } as const;
    }
}
