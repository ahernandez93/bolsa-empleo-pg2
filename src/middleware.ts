import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./lib/auth/authOptions";

const { auth: middleware } = NextAuth(authOptions);

const PUBLIC_EXACT = [
  "/login", // Login candidatos (raíz)
  "/admin/login", // Login administradores
  "/admin/registro", // Registro administradores
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

const PUBLIC_PREFIXES = [
  "/ofertas",        // incluye /ofertas/[id]
];

// APIs públicas (solo GET)
const PUBLIC_API_PREFIXES_GET = [
  "/api/ofertas",    // /api/ofertas y /api/ofertas/[id]
];

export default middleware((req) => {
  const { nextUrl, auth } = req;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!auth?.user;
  const role = (auth?.user as { role?: string } | undefined)?.role;
  const isApiAuthRoute = pathname.startsWith("/api/auth");

  const redirectTo = (path: string) => {
    const url = nextUrl.clone();
    url.pathname = path;
    url.search = ""; // opcional: limpia query
    return NextResponse.redirect(url);
  };

  // Permite que las rutas de la API de NextAuth pasen siempre
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Permitir rutas públicas
  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // APIs públicas GET (detalle de oferta sin sesión)
  if (
    req.method === "GET" &&
    PUBLIC_API_PREFIXES_GET.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Redirecciones de rutas antiguas de candidato
  if (pathname === "/candidate" || pathname.startsWith("/candidate/")) {
    if (pathname === "/candidate/login") {
      return redirectTo("/login");
    }
    return redirectTo("/");
  }

  // Rutas de administrador: solo ADMIN o RECLUTADOR
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return redirectTo("/admin/login");
    }
    const isAdminAreaRole =
      role === "ADMIN" ||
      role === "RECLUTADOR" ||
      role === "SUPERADMIN";

    if (!isAdminAreaRole) {
      return redirectTo("/admin/login");
    }
  }

  // Ruta principal de candidato en raíz: solo CANDIDATO
  if (pathname === "/") {
    if (!isLoggedIn) {
      return redirectTo("/login");
    }
    if (role !== "CANDIDATO") {
      return redirectTo("/login");
    }
  }

  // Para el resto de rutas protegidas, exigir autenticación
  if (!isLoggedIn) {
    return redirectTo("/admin/login");
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

