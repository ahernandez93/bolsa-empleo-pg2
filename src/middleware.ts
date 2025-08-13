import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "./lib/auth/authOptions"

const { auth: middleware } = NextAuth(authOptions)

const publicRoutes = [
    "/login",
    "/api/auth/register",
    "/api/auth",
    "/reset-password",
    "/verify-email",
    "/error"
]

export default middleware((req) => {
    const { nextUrl, auth } = req
    const isLoggetIn = !!auth?.user

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

    // Permite que las rutas de la API de NextAuth pasen siempre
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (!publicRoutes.includes(nextUrl.pathname) && !isLoggetIn) {
        return NextResponse.redirect(new URL("/login", nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
