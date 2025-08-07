"use client"

import * as React from "react"
/* import { AudioWaveform, BookOpen, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, House, PersonStanding } from "lucide-react" */

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { navigationData, /* projectsData, */ teamsData, userData } from '@/lib/navigation-data'

/* const navMainData = [
  {
    title: "Inicio",
    url: "#",
    icon: House,
    isActive: true,
    items: [
      {
        title: "Panel",
        url: "/",
      },
      {
        title: "Panel2",
        url: "#",
      },
      {
        title: "Panel3",
        url: "#",
      },
    ],
  },
  {
    title: "Recursos Humanos",
    url: "#",
    icon: PersonStanding,
    items: [
      {
        title: "Gestión de Empleados",
        url: "/empleados",
      },
      {
        title: "Departamentos",
        url: "/departamentos",
      },
      {
        title: "Cargos",
        url: "/cargos",
      },
    ],
  },
  {
    title: "Ofertas Laborales",
    url: "#",
    icon: BookOpen,
    items: [
      {
        title: "Crear Nueva Vacante",
        url: "/vacantes",
      },
      {
        title: "Postulaciones Recibidas",
        url: "/postulaciones",
      },
      {
        title: "Candidatos Registrados",
        url: "/candidatos",
      },
      {
        title: "Reportes",
        url: "/reportes",
      },
    ],
  },
  {
    title: "Configuraciones",
    url: "#",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "#",
      },
      {
        title: "Team",
        url: "#",
      },
      {
        title: "Billing",
        url: "#",
      },
      {
        title: "Limits",
        url: "#",
      },
    ],
  },
]

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Bolsa de Empleo",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
} */

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
