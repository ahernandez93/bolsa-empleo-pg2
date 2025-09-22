import Credentials from "next-auth/providers/credentials";
import { type NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with credentials:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.error("Missing credentials");
                    throw new Error("Email y contraseña son requeridos");
                }

                const { email, password } = credentials;

                try {
                    const user = await prisma.usuario.findUnique({
                        where: { email: email as string },
                        include: {
                            persona: true
                        }
                    });

                    if (!user) {
                        console.error("User not found:", email);
                        throw new Error("Usuario no encontrado");
                    }

                    if (!user.activo) {
                        console.error("User is inactive:", email);
                        throw new Error("Usuario inactivo");
                    }

                    const isPasswordValid = await bcrypt.compare(password as string, user.passwordHash as string);
                    if (!isPasswordValid) {
                        console.error("Invalid password for user:", email);
                        throw new Error("Contraseña incorrecta");
                    }

                    console.log("User authenticated successfully:", user.email);
                    console.log("Authorize user.empresaId:", user.empresaId);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.persona ? `${user.persona.nombre} ${user.persona.apellido}` : user.email,
                        role: user.rol,
                        empresaId: user.empresaId ?? null
                    };
                } catch (error) {
                    console.error("Database error during authentication:", error);
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error("Error de conexión a la base de datos");
                }
            },
        }),
    ],
    pages: {
        // Página de inicio de sesión para administradores
        signIn: "/admin/login",
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.userId = user.id
                token.email = user.email as string
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.name = typeof (user as any).name === "string" ? (user as any).name : token.name ?? null;
                token.role = (user as { role?: string }).role
                token.empresaId = (user as { empresaId?: string | null }).empresaId ?? null
            }
            return token
        },
        session: async ({ session, token }) => {
            if (token?.userId) {
                session.user.id = token.userId as string
                session.user.email = token.email as string
                session.user.name = typeof token.name === "string" ? token.name : undefined;
                (session.user as { role?: string }).role = token.role as string
                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as { empresaId?: string | null }).empresaId = (token as any).empresaId ?? null
            }
            return session
        },
    },
    // debug: process.env.NODE_ENV === 'development',
    trustHost: true,
} satisfies NextAuthConfig;
