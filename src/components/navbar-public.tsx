
import Link from "next/link";
import { Session } from "next-auth";
import NavUserCandidato from "@/components/nav-user-candidato";

export default function NavbarPublic({ session }: { session: Session | null }) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link
                        className="flex items-center gap-3 flex-1"
                        href="/"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">X</div>
                        <span className="font-bold text-lg">EmpresaX</span>
                    </Link>
                    {/* <Link href="/admin" className="flex items-center gap-3 flex-1">
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Image src="/logo.png" alt="Logo" style={{ objectFit: "contain", objectPosition: "left" }} fill priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                            </div>
                            <div className="grid flex-1 text-center text-lg leading-tight">
                                <span className="truncate font-bold text-lg">JobFlow</span>
                            </div>
                        </Link> */}
                </div>
                <nav className="hidden gap-6 text-sm text-slate-600 md:flex items-center">
                    <Link className="font-medium hover:text-slate-900" href="/ofertas">Ofertas</Link>
                    {session ? (
                        <>
                            <Link className="font-medium hover:text-slate-900" href="#">Guardados</Link>
                            <Link className="font-medium hover:text-slate-900" href="/postulaciones">Mis Postulaciones</Link>
                            <div className="flex items-center gap-3">
                                <NavUserCandidato session={session} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                className="font-medium hover:text-slate-900"
                                href="/registrar"
                            >Registrate</Link>
                            <Link
                                className="font-medium hover:text-slate-900"
                                href="/login"
                            >Iniciar Sesión</Link>
                        </>
                    )}

                </nav>

            </div>
        </header>
    )
}
