import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth/auth";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <SidebarProvider>
                    <AppSidebar session={session} />
                    <SidebarInset>
                        <DashboardHeader />
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
