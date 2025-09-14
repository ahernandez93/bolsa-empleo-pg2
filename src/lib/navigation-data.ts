import { AudioWaveform, BookOpen, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, LucideIcon, House, PersonStanding } from 'lucide-react'

export interface NavSubItem {
    title: string
    url: string
}
export interface NavItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavSubItem[]
}

export interface ProjectItem {
    name: string
    url: string
    icon: LucideIcon
}

export interface TeamItem {
    name: string
    logo: LucideIcon
    plan: string
}

export interface UserData {
    name: string
    email: string
    avatar: string
}

// Datos de navegación principal
export const navigationData: NavItem[] = [
    {
        title: "Inicio",
        url: "#",
        icon: House,
        isActive: true,
        items: [
            {
                title: "Dashboard",
                url: "/admin",
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
                url: "/admin/empleados",
            },
            {
                title: "Departamentos",
                url: "/admin/departamentos",
            },
            {
                title: "Cargos",
                url: "/admin/cargos",
            },
        ],
    },
    {
        title: "Ofertas Laborales",
        url: "#",
        icon: BookOpen,
        items: [
            {
                title: "Crear Nueva Oferta",
                url: "/admin/ofertaslaborales",
            },
            {
                title: "Postulaciones Recibidas",
                url: "/admin/postulaciones-recibidas",
            },
            {
                title: "Candidatos Registrados",
                url: "/admin/candidatos",
            },
            {
                title: "Reportes",
                url: "/admin/reportes",
            },
        ],
    },
    {
        title: "Ajustes",
        url: "#",
        icon: Settings2,
        items: [
            {
                title: "Configuraciones de la empresa",
                url: "/configuraciones",
            },
        ],
    },
]

// Datos de proyectos
export const projectsData: ProjectItem[] = [
    {
        name: "Design Engineering",
        url: "/dashboard/projects/design-engineering",
        icon: Frame,
    },
    {
        name: "Sales & Marketing",
        url: "/dashboard/projects/sales-marketing",
        icon: PieChart,
    },
    {
        name: "Travel",
        url: "/dashboard/projects/travel",
        icon: Map,
    },
]

// Datos de equipos
export const teamsData: TeamItem[] = [
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
]

// Datos del usuario
export const userData: UserData = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/generic-user-avatar.png",
}

// Función helper para encontrar un item de navegación por URL
export function findNavItemByUrl(url: string): { mainItem: NavItem; subItem?: NavSubItem } | null {
    for (const mainItem of navigationData) {
        if (mainItem.url === url) {
            return { mainItem }
        }

        if (mainItem.items && mainItem.items.length > 0) {
            for (const subItem of mainItem.items) {
                if (subItem.url === url) {
                    return { mainItem, subItem }
                }
            }
        }
    }

    return null
}

// Función helper para obtener todos los URLs de navegación
export function getAllNavigationUrls(): string[] {
    const urls: string[] = []

    navigationData.forEach(mainItem => {
        urls.push(mainItem.url)

        if (mainItem.items && mainItem.items.length > 0) {
            mainItem.items.forEach(subItem => {
                urls.push(subItem.url)
            })
        }
    })

    return urls
}
