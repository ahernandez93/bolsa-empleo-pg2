import NextAuth, { type NextAuthConfig } from "next-auth";

const edgeAuthConfig: NextAuthConfig = {
    session: { strategy: "jwt" },
    providers: [],
};

export const { auth: authEdge } = NextAuth(edgeAuthConfig);
