import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth/auth";

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            <SidebarProvider>
                <AppSidebar session={session} />
                <SidebarInset>
                    <DashboardHeader />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    );
}
