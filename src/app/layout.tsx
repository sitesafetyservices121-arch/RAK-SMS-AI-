import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/hooks/use-auth";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppNav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

import { LiveClock } from "@/components/live-clock";
import { ThemeProvider, ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "RAK-SMS: AI-Powered Safety Management System",
  description: "RAK-SMS is an AI-powered Safety Management System designed to streamline OHS, generate SHE plans, perform HIRA, and manage safety documents for the South African construction and industrial sectors.",
  keywords: ["Safety Management System", "OHS", "SHE Plan", "HIRA", "RAK-SMS", "AI Safety", "South Africa", "Construction Safety"],
  authors: [{ name: 'RAK-SMS' }],
  openGraph: {
    title: "RAK-SMS: AI-Powered Safety Management System",
    description: "Streamline your safety management with AI-driven tools for OHS, SHE plans, HIRA, and more.",
    url: 'https://raksms.services',
    siteName: 'RAK-SMS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RAK-SMS: AI-Powered Safety Management System",
    description: "AI-powered tools for comprehensive safety management in South Africa.",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.variable)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              <AppNav />
              <SidebarInset>
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
                  <div className="md:hidden">
                    <SidebarTrigger />
                  </div>
                  <div className="flex items-center gap-2">
                    <LiveClock />
                    <ThemeToggle />
                    <Button variant="ghost" size="icon">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                    </Button>
                    <UserNav />
                  </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
