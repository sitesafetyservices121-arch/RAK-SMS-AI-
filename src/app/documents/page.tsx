"use client";

import { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, File, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getDocumentsAction, type Document } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

const DocumentIcon = ({ type }: { type?: string }) => {
  if (!type) return <File className="h-4 w-4 text-gray-400" />;
  if (type.includes("pdf")) {
    return <FileText className="h-4 w-4 text-red-600" />;
  }
  if (type.includes("spreadsheet") || type.includes("excel")) {
    return <File className="h-4 w-4 text-green-600" />;
  }
  if (type.includes("zip") || type.includes("cad")) {
    return <File className="h-4 w-4 text-yellow-600" />;
  }
  return <File className="h-4 w-4 text-blue-600" />;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await getDocumentsAction();
        if (response.success && response.data) {
          setDocuments(response.data);
        } else {
          setError(response.error || "Failed to fetch documents.");
        }
      } catch (err) {
        setError("Unexpected error while fetching documents.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const groupedDocs = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const { category, subCategory } = doc;
      if (!acc[category]) {
        acc[category] = {};
      }
      if (!acc[category][subCategory]) {
        acc[category][subCategory] = [];
      }
      acc[category][subCategory].push(doc);
      return acc;
    }, {} as Record<string, Record<string, Document[]>>);
  }, [documents]);

  const categoryOrder = ["Safety", "Quality", "HR", "Environment", "Toolbox Talks"];

  const safetySubCategoryOrder: string[] = [
    "Safety Policy & Objectives",
    "Legal & Compliance Framework",
    "Risk Management",
    "Safe Work Procedures",
    "Method Statements",
    "Emergency Preparedness & Response",
    "Incident & Accident Reporting",
    "First Aid & Medical Surveillance",
    "PPE Management",
    "Training & Competency Records",
    "Toolbox Talks & Safety Communication",
    "Contractor & Visitor Management",
    "Environmental Management",
    "Quality Management",
    "Inspections & Audits",
    "Vehicle & Equipment Safety",
    "Resource & Site Management",
    "Storeroom & Inventory Control",
    "Monitoring & Reporting",
    "Continuous Improvement & Review",
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-7 w-1/4 mb-2" />
              <Skeleton className="h-px w-full mb-4" />
              <div className="space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div
                    key={j}
                    className="flex justify-between items-center p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>
            Centralized storage for safety, health, environment, and quality
            documents from Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Library</CardTitle>
        <CardDescription>
          Centralized storage for safety, health, environment, and quality
          documents from Firebase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {categoryOrder.map((category) => {
            const subCategories = groupedDocs[category] || {};
            const subCategoryKeys =
              category === "Safety"
                ? safetySubCategoryOrder.filter((key) => subCategories[key])
                : Object.keys(subCategories).sort();

            return (
              <div key={category}>
                <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                 <Separator className="my-2" />
                {Object.keys(subCategories).length > 0 ? (
                  subCategoryKeys.map((subCategory) => {
                    const docs = subCategories[subCategory];
                    if (!docs) return null;
                    return (
                      <div key={subCategory} className="pt-6">
                        <h3 className="text-lg font-semibold tracking-tight">
                          {subCategory}
                        </h3>
                        <Separator className="my-2" />
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Document Name</TableHead>
                              <TableHead>Version</TableHead>
                              <TableHead>Last Updated</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {docs.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  <DocumentIcon type={doc.type} />
                                  {doc.name}
                                </TableCell>
                                <TableCell>{doc.version}</TableCell>
                                <TableCell>{doc.lastUpdated}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" asChild>
                                    <a
                                      href={doc.downloadURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={doc.fileName}
                                    >
                                      <Download className="h-4 w-4" />
                                      <span className="sr-only">Download</span>
                                    </a>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground mt-2 text-sm italic">
                    No documents found in this category.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
