"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import LogoWordmark from "./brand/LogoWordmark"

export function TeamSwitcher({ teams }: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/admin" className="flex items-center gap-3 flex-1">
                {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/logo.png" alt="Logo" style={{ objectFit: "contain", objectPosition: "left" }} fill priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
                <div className="grid flex-1 text-center text-lg leading-tight">
                  <span className="truncate font-bold text-lg">{activeTeam.name}</span>
                </div> */}

                {/* <div
                  className="
                    flex size-10 items-center justify-center rounded-lg
                    bg-transparent
                    text-[#006CB4] dark:text-white
                    [--logo-accent:#22A36B] dark:[--logo-accent:#34D399]
                  "
                  aria-hidden
                >
                  <Image
                    src="/branding/logo-mark.svg"
                    alt=""
                    className="h-16 w-16"
                    loading="eager"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div> */}
                <div className="w-full flex items-center justify-center px-0 py-2">
                  <LogoWordmark className="h-12 w-auto" />
                </div>
              </Link>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
