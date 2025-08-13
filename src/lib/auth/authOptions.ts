
import Credentials from "next-auth/providers/credentials";
import { type NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        Credentials({
            // name: "Credentials",
            credentials: {
                email: { },
                password: { },
            },
            async authorize(credentials) {
                console.log("Credentials:", credentials);
                if (!credentials) {
                    throw new Error("Credenciales inválidas");
                }

                const { email, password } = credentials as { email: string; password: string };

                const user = await prisma.usuario.findUnique({
                    where: { email },
                });

                if (!user) {
                    throw new Error("Usuario no encontrado");
                }

                const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
                if (!isPasswordValid) {
                    throw new Error("Contraseña incorrecta");
                }
                return {
                    id: user.id,
                    email: user.email,
                };
            },
        }),
    ],
    /* callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        },
    }, */
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.userId = user.id
                token.email = user.email as string
            }
            return token
        },
        session: async ({ session, token }) => {
            if (token?.userId) {
                session.user.id = token.userId as string
                session.user.email = token.email as string
            }
            return session
        },
    },
    trustHost: true,
} satisfies NextAuthConfig;