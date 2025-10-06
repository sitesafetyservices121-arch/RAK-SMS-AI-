// /components/app-nav.tsx
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
  ClipboardList,
  ChevronDown,
  Car,
  Warehouse,
  Map,
  Shirt,
  Briefcase,
  FolderKanban,
  Users,
  Shield,
  BrainCircuit,
  Bot,
  BookOpen,
  Newspaper,
  FilePlus,
  User,
  LifeBuoy,
  CreditCard,
  MessageSquare,
  List,
  FlaskConical,
  UploadCloud,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { AppLogo } from "@/components/app-logo";
import { WilsonLogo } from "@/components/wilson-logo";
import { useAuth } from "@/hooks/use-auth";


// 🗂️ Menu configuration
const menuConfig = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/documents", label: "Document Library", icon: Library },
      { href: "/generated-documents", label: "Generated Documents", icon: FolderKanban },
      { href: "/news", label: "News", icon: Newspaper },
      { href: "/how-to-guide", label: "How-to Guide", icon: BookOpen },
    ],
  },
  {
    label: "Management Tools",
    icon: Briefcase,
    collapsible: true,
    items: [
      { href: "/employee-training-tracker", label: "Training Tracker", icon: ClipboardList },
      { href: "/storeroom-tracker", label: "Storeroom Tracker", icon: Warehouse },
      { href: "/site-resource-tracker", label: "Site & Resource Tracker", icon: Map },
      { href: "/vehicle-inspection-tracker", label: "Vehicle Inspection", icon: Car },
      { href: "/ppe-issue-register", label: "PPE Issue Register", icon: Shirt },
      { href: "/toolbox-talks", label: "Toolbox Talks", icon: MessageSquare },
      { href: "/sds-management", label: "SDS Management", icon: FlaskConical },
    ],
  },
  {
    label: "AI Tools",
    icon: Bot,
    collapsible: true,
    items: [
      { href: "/she-plan-generator", label: "SHE Plan Generator", icon: FileText },
      { href: "/hira-generator", label: "HIRA Generator", icon: ShieldAlert },
      { href: "/safe-work-procedure", label: "Safe Work Procedure", icon: ClipboardCheck },
      { href: "/method-statement", label: "Method Statement", icon: DraftingCompass },
      { href: "/ltir-analysis", label: "LTIR Trend Analysis", icon: LineChart },
    ],
  },
  {
    label: "Consultant",
    items: [
      { href: "/ohs-consultant", label: "Wilson - OHS Consultant", icon: WilsonLogo },
    ],
    role: "consultant",
  },
  {
    label: "My Account",
    icon: User,
    collapsible: true,
    items: [
      { href: "/account/settings", label: "Settings", icon: User },
      { href: "/account/billing", label: "Billing", icon: CreditCard },
      { href: "/support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    label: "Admin",
    icon: Shield,
    collapsible: true,
    role: "admin",
    items: [
      { href: "/admin", label: "Admin Dashboard", icon: Shield },
      { href: "/admin/onboarding", label: "Onboarding", icon: Users },
      { href: "/admin/prescription-management", label: "Prescription Mgt", icon: ClipboardCheck },
      { href: "/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/admin/document-upload", label: "Document Upload", icon: Library },
      { href: "/admin/bulk-import", label: "Bulk Import", icon: UploadCloud },
      { href: "/admin/create-news", label: "Create News", icon: FilePlus },
      { href: "/admin/wilson-training", label: "AI Training", icon: BrainCircuit },
      { href: "/admin/model-inspector", label: "Model Inspector", icon: List },
    ],
  },
];

export function AppNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = (user?.role ?? "user") as "user" | "admin" | "consultant";

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <nav aria-label="Main Navigation">
          <SidebarMenu>
            {menuConfig.map((section) => {
              if (section.role && section.role !== userRole) return null;

              if (section.collapsible) {
                const isSectionActive = section.items.some((item) => isActive(item.href));
                return (
                  <Collapsible key={section.label} defaultOpen={isSectionActive} asChild>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="justify-between"
                          tooltip={{ children: section.label, side: "right", align: "center" }}
                          aria-expanded={isSectionActive}
                        >
                          <div className="flex items-center gap-2">
                            {section.icon && <section.icon className="h-4 w-4" />}
                            <span>{section.label}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 mt-2">
                          {section.items.map((item) => (
                            <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton
                                asChild
                                size="sm"
                                isActive={isActive(item.href)}
                                tooltip={{ children: item.label, side: "right", align: "center" }}
                              >
                                <Link href={item.href}>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return section.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={{ children: item.label, side: "right", align: "center" }}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ));
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
