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
  ChevronDown,
  Car,
  Warehouse,
  Map,
  Shirt,
  Briefcase,
  FolderKanban,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { AppLogo } from "./app-logo";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/documents", label: "Document Library", icon: Library },
  { href: "/generated-documents", label: "Generated Documents", icon: FolderKanban },
];

const managementTools = [
  { href: "/employee-training-tracker", label: "Training Tracker", icon: ClipboardList },
  { href: "/storeroom-tracker", label: "Storeroom Tracker", icon: Warehouse },
  { href: "/site-resource-tracker", label: "Site & Resource Tracker", icon: Map },
  { href: "/vehicle-inspection-tracker", label: "Vehicle Inspection", icon: Car },
  { href: "/ppe-issue-register", label: "PPE Issue Register", icon: Shirt },
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
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label, side: "right", align: "center" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <Collapsible asChild>
            <SidebarMenuItem>
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="justify-between"
                    tooltip={{ children: "Management Tools", side: "right", align: "center" }}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase />
                      <span>Management Tools</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-2">
                    {managementTools.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          isActive={isActive(item.href)}
                          tooltip={{ children: item.label, side: "right", align: "center" }}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </>
            </SidebarMenuItem>
          </Collapsible>
          
          <Collapsible asChild>
            <SidebarMenuItem>
              <>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="justify-between"
                    tooltip={{ children: "AI Tools", side: "right", align: "center" }}
                  >
                    <div className="flex items-center gap-2">
                      <Bot />
                      <span>AI Tools</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-4 mt-2">
                    {aiTools.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          isActive={isActive(item.href)}
                          tooltip={{ children: item.label, side: "right", align: "center" }}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </>
            </SidebarMenuItem>
          </Collapsible>

          {consultant.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label, side: "right", align: "center" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
