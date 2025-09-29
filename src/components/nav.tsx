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
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={{children: item.label, side: "right", align: "center"}}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarGroup>
            <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
            {aiTools.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={{children: item.label, side: "right", align: "center"}}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Consultant</SidebarGroupLabel>
            {consultant.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={{children: item.label, side: "right", align: "center"}}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
