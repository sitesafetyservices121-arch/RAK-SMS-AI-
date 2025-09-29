"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  FileText,
  ShieldAlert,
  ClipboardCheck,
  DraftingCompass,
  LineChart,
  Bot,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { AppLogo } from "./app-logo";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/documents", label: "Document Library", icon: Library },
];

const aiTools = [
  { href: "/she-plan-generator", label: "SHE Plan Generator", icon: FileText },
  { href: "/hira-generator", label: "HIRA Generator", icon: ShieldAlert },
  { href: "/safe-work-procedure", label: "Safe Work Procedure", icon: ClipboardCheck },
  { href: "/method-statement", label: "Method Statement", icon: DraftingCompass },
  { href: "/ltir-analysis", label: "LTIR Trend Analysis", icon: LineChart },
  { href: "/employee-training-tracker", label: "Training Tracker", icon: ClipboardList },
];

const consultant = [
  { href: "/ohs-consultant", label: "Wilson - OHS Consultant", icon: Bot },
];

export function AppNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{children: item.label, side: "right", align: "center"}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarGroup>
            <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
            {aiTools.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{children: item.label, side: "right", align: "center"}}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Consultant</SidebarGroupLabel>
            {consultant.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{children: item.label, side: "right", align: "center"}}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}