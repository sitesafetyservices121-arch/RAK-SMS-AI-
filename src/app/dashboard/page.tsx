import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Library,
  ShieldAlert,
  ClipboardCheck,
  DraftingCompass,
  LineChart,
  Bot,
  ClipboardList,
  Car,
  Warehouse,
  Map,
  Shirt,
  FolderKanban,
} from "lucide-react";

const tools = [
  {
    icon: <Library className="h-8 w-8 text-primary" />,
    title: "Document Library",
    description: "Access all your safety documents in one place.",
    href: "/documents",
  },
  {
    icon: <FolderKanban className="h-8 w-8 text-primary" />,
    title: "Generated Documents",
    description: "View and manage all AI-generated documents by client.",
    href: "/generated-documents",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "SHE Plan Generator",
    description: "Instantly generate comprehensive SHE plans.",
    href: "/she-plan-generator",
  },
  {
    icon: <ShieldAlert className="h-8 w-8 text-primary" />,
    title: "HIRA Generator",
    description: "Automate Hazard Identification & Risk Assessments.",
    href: "/hira-generator",
  },
  {
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    title: "Safe Work Procedure",
    description: "Create detailed safe work procedures with AI.",
    href: "/safe-work-procedure",
  },
  {
    icon: <DraftingCompass className="h-8 w-8 text-primary" />,
    title: "Method Statement",
    description: "Generate professional method statements.",
    href: "/method-statement",
  },
  {
    icon: <LineChart className="h-8 w-8 text-primary" />,
    title: "LTIR Trend Analysis",
    description: "Analyze LTIR data to find safety trends.",
    href: "/ltir-analysis",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Wilson - OHS Consultant",
    description: "Your AI expert on South African OHS acts.",
    href: "/ohs-consultant",
  },
  {
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
    title: "Employee Training Tracker",
    description: "Track employee training records and certifications.",
    href: "/employee-training-tracker",
  },
  {
    icon: <Car className="h-8 w-8 text-primary" />,
    title: "Vehicle & Inspection Tracker",
    description: "Record vehicle inspections and damage reports.",
    href: "/vehicle-inspection-tracker",
  },
  {
    icon: <Warehouse className="h-8 w-8 text-primary" />,
    title: "Storeroom Tracker",
    description: "Manage storeroom inventory and stocktakes.",
    href: "/storeroom-tracker",
  },
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: "Site & Resource Tracker",
    description: "Visualize site layouts and resource allocation.",
    href: "/site-resource-tracker",
  },
  {
    icon: <Shirt className="h-8 w-8 text-primary" />,
    title: "PPE Issue Register",
    description: "Track the issuance and maintenance of PPE.",
    href: "/ppe-issue-register",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to RAK-SMS</h1>
        <p className="text-muted-foreground">
          Your AI-powered Safety Management System.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <Card
            key={tool.href}
            className="flex flex-col transition-all hover:shadow-lg"
          >
            <CardHeader className="flex-row items-center gap-4">
              {tool.icon}
              <div className="flex flex-col">
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={tool.href}>
                  Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
