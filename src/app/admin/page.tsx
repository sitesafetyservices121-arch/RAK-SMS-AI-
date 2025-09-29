
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
  Users,
  ClipboardCheck,
  Library,
  BrainCircuit,
} from "lucide-react";

const adminTools = [
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Client Onboarding",
    description: "Manage and onboard new clients.",
    href: "/admin/onboarding",
  },
  {
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    title: "Prescription Management",
    description: "Handle and oversee safety prescriptions.",
    href: "/admin/prescription-management",
  },
  {
    icon: <Library className="h-8 w-8 text-primary" />,
    title: "Document Upload",
    description: "Upload new documents to the library.",
    href: "/admin/document-upload",
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: "AI Training",
    description: "Upload reference documents for the AI consultant.",
    href: "/admin/wilson-training",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage system settings and content.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adminTools.map((tool) => (
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
