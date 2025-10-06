"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type SdsDocument = {
  id: string;
  productName: string;
  supplier: string;
  revisionDate: string;
  fileUrl: string;
};

const initialSdsDocs: SdsDocument[] = [
  {
    id: "sds-001",
    productName: "Acetone",
    supplier: "Chemical Corp",
    revisionDate: "2023-10-15",
    fileUrl: "#",
  },
  {
    id: "sds-002",
    productName: "WD-40 Multi-Use Product",
    supplier: "WD-40 Company",
    revisionDate: "2024-01-20",
    fileUrl: "#",
  },
];

export default function SdsManagementPage() {
  const [sdsDocuments, setSdsDocuments] = useState<SdsDocument[]>(initialSdsDocs);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const productName = formData.get("productName") as string;
    const supplier = formData.get("supplier") as string;
    const file = formData.get("sdsFile") as File;

    // Simulate upload and state update
    setTimeout(() => {
      if (productName && supplier && file && file.size > 0) {
        const newDoc: SdsDocument = {
          id: `sds-${Date.now()}`,
          productName,
          supplier,
          revisionDate: new Date().toISOString().split("T")[0],
          fileUrl: URL.createObjectURL(file), // Create a temporary URL for the new file
        };
        setSdsDocuments((prev) => [newDoc, ...prev]);

        toast({
          title: "Upload Successful",
          description: `SDS for ${productName} has been uploaded.`,
        });
        e.currentTarget.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Please fill out all fields and select a file.",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload New SDS</CardTitle>
          <CardDescription>
            Upload a new Safety Data Sheet (SDS) for a product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUpload}>
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="e.g., Acetone"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                placeholder="e.g., Chemical Corp"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sdsFile">SDS File (PDF)</Label>
              <Input
                id="sdsFile"
                name="sdsFile"
                type="file"
                accept=".pdf"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {isLoading ? "Uploading..." : "Upload SDS"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SDS Library</CardTitle>
          <CardDescription>
            List of currently available Safety Data Sheets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Revision Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sdsDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    {doc.productName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.supplier}</Badge>
                  </TableCell>
                  <TableCell>{doc.revisionDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.fileUrl} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sdsDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No SDS documents uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
