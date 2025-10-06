"use client";

import { DocumentList } from "@/components/document-list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentsPage() {
  const categories = [
    "Safety",
    "Quality",
    "Environment",
    "HR",
    "Toolbox Talks",
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
        <p className="text-muted-foreground">
          Access and manage all safety, health, environment, and quality
          documents.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Company Documents</CardTitle>
          <CardDescription>Browse documents by category.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Safety" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="mt-4">
                <DocumentList category={cat} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
