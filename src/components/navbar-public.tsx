"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Session } from "next-auth"
import NavUserCandidato from "@/components/nav-user-candidato"

export default function NavbarPublic({ session }: { session: Session | null }) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    // Para evitar mismatch: en SSR (mounted=false) devolvemos clases neutras.
    const linkClass = useMemo(() => {
        return (path: string) => {
            const isActive = mounted && pathname === path
            return [
                "relative font-medium transition-colors duration-200",
                isActive ? "text-emerald-600" : "text-slate-600 hover:text-emerald-700",
                "after:absolute after:left-1/2 after:-bottom-[3px] after:h-[2px] after:bg-emerald-600",
                "after:w-0 after:-translate-x-1/2 after:rounded-full after:transition-all after:duration-300",
                "hover:after:w-full",
                // Sólo cuando ya montó aplicamos la línea completa al activo
                isActive ? "after:w-full" : "",
            ].join(" ")
        }
    }, [mounted, pathname])

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-3 flex-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">PIE</div>
                        <span className="font-bold text-lg">Plataforma Integral de Empleabilidad</span>
                    </Link>
                </div>

                {/* suppressHydrationWarning es un extra por si algún className difiere entre SSR/CSR */}
                <nav className="hidden md:flex items-center gap-6 text-sm" suppressHydrationWarning>
                    <Link href="/ofertas" className={linkClass("/ofertas")}>Ofertas</Link>

                    {session ? (
                        <>
                            <Link href="/guardados" className={linkClass("/guardados")}>Guardados</Link>
                            <Link href="/postulaciones" className={linkClass("/postulaciones")}>Mis Postulaciones</Link>
                            <div className="flex items-center gap-3">
                                <NavUserCandidato session={session} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/registrar" className={linkClass("/registrar")}>Registrate</Link>
                            <Link href="/login" className={linkClass("/login")}>Iniciar Sesión</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}
