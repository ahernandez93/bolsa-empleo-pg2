"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { findNavItemByUrl } from '@/lib/navigation-data'

interface BreadcrumbItem {
    title: string
    url: string
    isActive: boolean
}

export function useBreadcrumbs() {
    const pathname = usePathname()

    const breadcrumbs = useMemo(() => {
        const crumbs: BreadcrumbItem[] = []

        // Always add Dashboard as the first breadcrumb
        /* crumbs.push({
            title: "Dashboard",
            url: "/",
            isActive: pathname === "/"
        }) */

        // Use helper function to find navigation item
        const navMatch = findNavItemByUrl(pathname)

        if (navMatch) {
            const { mainItem, subItem } = navMatch

            // Add main section if we're in a subsection
            if (subItem) {
                crumbs.push({
                    title: mainItem.title,
                    url: mainItem.url,
                    isActive: false
                })

                // Add subsection
                crumbs.push({
                    title: subItem.title,
                    url: subItem.url,
                    isActive: true
                })
            } else {
                // We're in a main section
                crumbs.push({
                    title: mainItem.title,
                    url: mainItem.url,
                    isActive: true
                })
            }
        } /* else if (pathname === "/dashboard") {
            // Only show Dashboard if we're actually on the dashboard page
            crumbs.push({
                title: "Dashboard",
                url: "/dashboard",
                isActive: true
            })
        } */

        // If no specific match found, just return Dashboard
        return crumbs
    }, [pathname])

    return breadcrumbs
}