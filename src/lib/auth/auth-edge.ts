// src/lib/auth/auth-edge.ts
import NextAuth, { type NextAuthConfig } from "next-auth";

// Ojo: AQUÍ no metas Prisma ni bcrypt ni adapters.
// El middleware solo necesita poder leer el JWT, no autenticar.

const edgeAuthConfig: NextAuthConfig = {
    session: { strategy: "jwt" },
    providers: [],
    // No hace falta providers para leer el token.
    // Si querés, podés dejar callbacks mínimos, pero nada que toque DB.
};

export const { auth: authEdge } = NextAuth(edgeAuthConfig);
