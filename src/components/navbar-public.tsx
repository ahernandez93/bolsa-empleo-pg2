"use client"

import Link from "next/link"
import { JSX, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Session } from "next-auth"
import NavUserCandidato from "@/components/nav-user-candidato"
import Image from "next/image"
// Shadcn / Lucide
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"
import { Menu, Briefcase, Bookmark, FileText, UserPlus, LogIn } from "lucide-react"

function BrandDesktop() {
    return (
        <Link
            href="/"
            className="hidden md:flex items-center gap-3
                    text-[#006CB4] dark:text-[#3BA8FF]
                    [--logo-accent:#22A36B] dark:[--logo-accent:#34D399]
                    transition-all pt-1 pb-1"

            aria-label="Ir al inicio"
        >
            <Image
                src="/branding/logo-horizontal.svg"
                alt="EmpleaHub"
                className="h-16 w-auto"
                width={180}
                height={48}
                priority
            />
        </Link>
    )
}

function BrandMobile() {
    return (
        <Link
            href="/"
            className="md:hidden flex items-center
                    text-[#006CB4] dark:text-[#3BA8FF]
                    [--logo-accent:#22A36B] dark:[--logo-accent:#34D399]
                    transition-all"
            aria-label="Ir al inicio"
        >
            <Image
                src="/branding/logo-mark.svg"
                alt="EmpleaHub"
                className="h-14 w-auto"
                width={64}
                height={64}
                priority
            />
        </Link>
    )
}

export default function NavbarPublic({ session }: { session: Session | null }) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const linkClass = useMemo(() => {
        return (path: string) => {
            const isActive = mounted && pathname === path
            return [
                "relative flex items-center gap-2 font-medium transition-colors duration-200",
                isActive ? "text-emerald-600" : "text-slate-600 hover:text-emerald-700",
                "after:absolute after:left-1/2 after:-bottom-[3px] after:h-[2px] after:bg-emerald-600",
                "after:w-0 after:-translate-x-1/2 after:rounded-full after:transition-all after:duration-300",
                "hover:after:w-full",
                isActive ? "after:w-full" : "",
            ].join(" ")
        }
    }, [mounted, pathname])

    // 🧠 definimos los íconos una sola vez
    const links = session
        ? [
            { href: "/ofertas", label: "Ofertas", icon: <Briefcase className="h-4 w-4" /> },
            { href: "/guardados", label: "Guardados", icon: <Bookmark className="h-4 w-4" /> },
            { href: "/postulaciones", label: "Mis Postulaciones", icon: <FileText className="h-4 w-4" /> },
        ]
        : [
            { href: "/ofertas", label: "Ofertas", icon: <Briefcase className="h-4 w-4" /> },
            { href: "/registrar", label: "Registrate", icon: <UserPlus className="h-4 w-4" /> },
            { href: "/login", label: "Iniciar Sesión", icon: <LogIn className="h-4 w-4" /> },
        ]

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <BrandMobile />
                    <BrandDesktop />
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm" suppressHydrationWarning>
                    {links.map((l) => (
                        <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                            {l.icon}
                            {l.label}
                        </Link>
                    ))}
                    {session && (
                        <div className="flex items-center gap-3 ml-4">
                            <NavUserCandidato session={session} />
                        </div>
                    )}
                </nav>

                {/* Mobile trigger */}
                <div className="md:hidden">
                    <MobileMenu session={session} linkClass={linkClass} links={links} />
                </div>
            </div>
        </header>
    )
}

function MobileMenu({
    session,
    linkClass,
    links,
}: {
    session: Session | null
    linkClass: (path: string) => string
    links: { href: string; label: string; icon: JSX.Element }[]
}) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[85%] sm:w-80 p-0">
                <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="
                                flex items-center gap-2
                                text-[#006CB4] dark:text-[#3BA8FF]
                                [--logo-accent:#22A36B] dark:[--logo-accent:#34D399]"
                            onClick={() => setOpen(false)}
                        >
                            {/* Usá el móvil con texto o solo isotipo, como prefieras */}
                            <Image
                                src="/branding/logo-mark.svg"
                                alt="EmpleaHub"
                                className="h-14 w-auto"
                                width={64}
                                height={64}
                                priority
                            />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <ul className="flex flex-col p-2">
                    {links.map((l) => (
                        <li key={l.href}>
                            <SheetClose asChild>
                                <Link
                                    href={l.href}
                                    className="flex items-center gap-3 px-4 py-3 text-base hover:bg-slate-50"
                                >
                                    {l.icon}
                                    <span className={linkClass(l.href)}>{l.label}</span>
                                </Link>
                            </SheetClose>
                        </li>
                    ))}
                </ul>

                {session && (
                    <>
                        <div className="px-4 py-2 border-t text-xs text-slate-500">Cuenta</div>
                        <div className="px-2">
                            <NavUserCandidato session={session} onNavigate={() => setOpen(false)} />
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
