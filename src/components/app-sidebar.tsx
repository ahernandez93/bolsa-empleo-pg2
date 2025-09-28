"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { navigationData, /* projectsData, */ teamsData } from '@/lib/navigation-data'
import type { Session } from "next-auth"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null
}

export function AppSidebar({session, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamsData} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData} />
        {/* <NavProjects projects={projectsData} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
