"use client";

import type { PropsWithChildren } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppNav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { LiveClock } from "@/components/live-clock";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingDots from "@/components/ui/loading-dots";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not loading and user is not an admin
    if (!loading && user?.role !== 'admin') {
      router.replace("/unauthorized");
    }
  }, [loading, user, router]);

  if (loading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  return (
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
  );
}
