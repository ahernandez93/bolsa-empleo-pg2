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
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.persona ? `${user.persona.nombre} ${user.persona.apellido}` : user.email,
                        role: user.rol,
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
        signIn: "/login",
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.userId = user.id
                token.email = user.email as string
                token.name = user.name
                // token.role = (user as { role: string }).role
            }
            return token
        },
        session: async ({ session, token }) => {
            if (token?.userId) {
                session.user.id = token.userId as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                // (session.user as { role: string }).role = token.role as string
            }
            return session
        },
    },
    // debug: process.env.NODE_ENV === 'development',
    trustHost: true,
} satisfies NextAuthConfig;