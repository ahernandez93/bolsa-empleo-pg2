"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { navigationData, /* projectsData, */ teamsData } from '@/lib/navigation-data'
import type { Session } from "next-auth"
import type { UserRole, NavItem } from "@/lib/navigation-data"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null
}

const canSee = (effectiveRole: UserRole, roles?: UserRole[]) => {
  // si no se definieron roles, cualquiera lo puede ver
  if (!roles || roles.length === 0) return true

  // SUPERADMIN manda
  if (effectiveRole === "SUPERADMIN") return true

  // de lo contrario, revisamos si está en la lista
  return roles.includes(effectiveRole)
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role as UserRole | undefined

  const effectiveRole: UserRole = role ?? "RECLUTADOR"

  const filteredItems: NavItem[] = navigationData
    .filter((item) => canSee(effectiveRole, item.roles))
    .map((item) => ({
      ...item,
      items: item.items?.filter((sub) => canSee(effectiveRole, sub.roles)),
    }))
    .filter((item) => {
      if (!item.items || item.items.length === 0) {
        return !!item.url && item.url !== "#"
      }
      return true
    })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
