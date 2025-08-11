import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from '@/components/dashboard-header'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolsa de Empleo",
  description: "Bolsa de Empleo es una plataforma de intermediacion laboral",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <DashboardHeader /> */}
              {children}
              <Toaster />
            {/* </SidebarInset>
          </SidebarProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
