
import { signIn } from '@/lib/auth/auth';
import { AuthError } from 'next-auth';

export const LoginAction = async (email: string, password: string) => {
    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false
        });
        return { success: true, error: null };
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, error: error.cause?.err?.message };
        }
        return { success: false, error: "Error al iniciar sesión" };
    }
}