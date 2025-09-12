import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./lib/auth/authOptions";

const { auth: middleware } = NextAuth(authOptions);

const publicRoutes = [
  "/login", // Login candidatos (raíz)
  "/admin/login", // Login administradores
  "/registrar", // Registro candidatos
  "/ofertas", // Vacantes
  "/api/auth/register",
  "/api/auth",
  "/api/seed",
  "/reset-password",
  "/verify-email",
  "/error",
  "/"
];

export default middleware((req) => {
  const { nextUrl, auth } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!auth?.user;
  const role = (auth?.user as { role?: string } | undefined)?.role;

  const isApiAuthRoute = pathname.startsWith("/api/auth");

  // Permite que las rutas de la API de NextAuth pasen siempre
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Permitir rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirecciones de rutas antiguas de candidato
  if (pathname === "/candidate" || pathname.startsWith("/candidate/")) {
    if (pathname === "/candidate/login") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Rutas de administrador: solo ADMIN o RECLUTADOR
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (role !== "ADMIN" && role !== "RECLUTADOR") {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
  }

  // Ruta principal de candidato en raíz: solo CANDIDATO
  if (pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "CANDIDATO") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // Para el resto de rutas protegidas, exigir autenticación
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',

    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

