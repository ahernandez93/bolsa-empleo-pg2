import NextAuth from "next-auth"
import { authOptions } from "./authOptions";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    ...authOptions,
});