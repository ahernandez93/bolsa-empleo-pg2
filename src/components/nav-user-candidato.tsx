"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react"
import { Session } from "next-auth"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function NavUserCandidato({ session, onNavigate }: { session: Session | null, onNavigate?: () => void }) {
    const closeSession = async () => {
        onNavigate?.()
        await signOut({ callbackUrl: "/" })
    }
    const user = session?.user;
    const initials = user?.name?.split(' ').map((n) => n[0]).join('') || "";
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className="flex items-center gap-2"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user?.name}</span>
                            <span className="truncate text-xs">{user?.email}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    // side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.name}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href="/perfil" onClick={onNavigate}>
                                <BadgeCheck className="mr-2 h-4 w-4" />
                                Perfil
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={closeSession}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
