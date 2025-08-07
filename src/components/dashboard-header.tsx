"use client"

import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { BookOpen, Bot, Settings2, SquareTerminal } from 'lucide-react'
import { navigationData } from '@/lib/navigation-data'

// Navigation data
/* const navData = [
    {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
            {
                title: "History",
                url: "/dashboard/playground/history",
            },
            {
                title: "Starred",
                url: "/dashboard/playground/starred",
            },
            {
                title: "Settings",
                url: "/dashboard/playground/settings",
            },
        ],
    },
    {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
            {
                title: "Genesis",
                url: "/dashboard/models/genesis",
            },
            {
                title: "Explorer",
                url: "/dashboard/models/explorer",
            },
            {
                title: "Quantum",
                url: "/dashboard/models/quantum",
            },
        ],
    },
    {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
            {
                title: "Introduction",
                url: "/dashboard/docs/introduction",
            },
            {
                title: "Get Started",
                url: "/dashboard/docs/get-started",
            },
            {
                title: "Tutorials",
                url: "/dashboard/docs/tutorials",
            },
            {
                title: "Changelog",
                url: "/dashboard/docs/changelog",
            },
        ],
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
            {
                title: "General",
                url: "/dashboard/settings/general",
            },
            {
                title: "Team",
                url: "/dashboard/settings/team",
            },
            {
                title: "Billing",
                url: "/dashboard/settings/billing",
            },
            {
                title: "Limits",
                url: "/dashboard/settings/limits",
            },
        ],
    },
] */

export function DashboardHeader() {
    const breadcrumbs = useBreadcrumbs(navigationData)

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <DynamicBreadcrumb items={breadcrumbs} />
            </div>
        </header>
    )
}
