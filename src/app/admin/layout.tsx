import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/hooks/use-auth";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppNav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

import { LiveClock } from "@/components/live-clock";
import { ThemeProvider, ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "RA Admin Dashboard",
  description: "Admin panel for managing platform features",
};

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={cn(inter.variable, "h-full")}>
      <body className="h-full">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <SidebarInset>
                <header className="flex items-center justify-between border-b px-4 py-2">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <AppNav />
                  </div>
                  <div className="flex items-center gap-4">
                    <LiveClock />
                    <ThemeToggle />
                    <Button variant="ghost" size="icon">
                      <Bell className="h-5 w-5" />
                    </Button>
                    <UserNav />
                  </div>
                </header>
                <main className="p-4">{children}</main>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
