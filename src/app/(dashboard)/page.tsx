// /app/(dashboard)/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LineChart,
  Library,
  ShieldCheck,
  Truck,
  Newspaper,
  ChevronRight,
  FileText,
  ShieldAlert,
  ClipboardCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Mock data for dashboard stats - in a real app, this would be fetched
const dashboardStats = {
  ltir: 0.85,
  documents: 124,
  trainingCompliance: 92,
  vehiclesReady: 18,
};

const recentNews = [
  {
    id: "news-1",
    title: "Updated Construction Regulations (2024) Now in Effect",
    date: "2024-07-28",
  },
  {
    id: "news-2",
    title: "Q3 Safety Target: 10% Reduction in LTIR",
    date: "2024-07-15",
  },
];

const quickActions = [
  { href: "/she-plan-generator", label: "Generate SHE Plan", icon: FileText },
  { href: "/hira-generator", label: "Generate HIRA", icon: ShieldAlert },
  {
    href: "/safe-work-procedure",
    label: "Generate SWP",
    icon: ClipboardCheck,
  },
];

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a snapshot of your safety management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTIR</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.ltir}</div>
            <p className="text-xs text-muted-foreground">
              Lost Time Injury Rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Document Library
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.documents}
            </div>
            <p className="text-xs text-muted-foreground">Total documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Training Compliance
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.trainingCompliance}%
            </div>
            <p className="text-xs text-muted-foreground">
              Employees with valid certs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehicle Readiness
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.vehiclesReady}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicles passed inspection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent News Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" /> Recent News & Updates
            </CardTitle>
            <CardDescription>
              Stay informed with the latest company announcements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNews.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/news">Read</Link>
                    </Button>
                  </div>
                  {index < recentNews.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most-used tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link href={action.href} className="flex items-center gap-2">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{action.label}</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
