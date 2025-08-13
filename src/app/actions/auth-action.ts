'use server'

import { signIn } from '@/lib/auth/auth';
import { AuthError } from 'next-auth';

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
            // Handle different types of AuthError
            switch (error.type) {
                case 'CredentialsSignin':
                    return { success: false, error: "Credenciales inválidas" };
                case 'CallbackRouteError':
                    return { success: false, error: error.cause?.err?.message || "Error en el callback de autenticación" };
                default:
                    return { success: false, error: error.message || "Error de autenticación" };
            }
        }
        
        // Handle other types of errors
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        
        return { success: false, error: "Error desconocido al iniciar sesión" };
    }
}