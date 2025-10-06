"use client";

import { useEffect, useState } from "react";
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
import type { SdsDocument } from "@/types/sds";

async function fetchSdsDocuments(): Promise<SdsDocument[]> {
  const res = await fetch("/api/sds");
  if (!res.ok) throw new Error("Failed to fetch SDS documents");
  const payload = await res.json();
  return payload.data ?? [];
}

async function uploadSds(payload: {
  productName: string;
  supplier: string;
  revisionDate?: string;
  fileName: string;
  fileType: string;
  fileBase64: string;
}): Promise<SdsDocument> {
  const res = await fetch("/api/sds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to upload SDS document");
  const data = await res.json();
  return data.data as SdsDocument;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1];
        resolve(base64 ?? "");
      } else {
        reject(new Error("Unable to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function SdsManagementPage() {
  const [sdsDocuments, setSdsDocuments] = useState<SdsDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const docs = await fetchSdsDocuments();
        setSdsDocuments(docs);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load SDS documents.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const productName = formData.get("productName") as string;
    const supplier = formData.get("supplier") as string;
    const file = formData.get("sdsFile") as File;

    if (!productName || !supplier || !file) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Please fill out all fields and select a file.",
      });
      setIsUploading(false);
      return;
    }

    try {
      const fileBase64 = await readFileAsBase64(file);
      const uploaded = await uploadSds({
        productName,
        supplier,
        revisionDate: new Date().toISOString().split("T")[0],
        fileName: file.name,
        fileType: file.type,
        fileBase64,
      });
      setSdsDocuments((prev) => [uploaded, ...prev]);
      toast({
        title: "Upload Successful",
        description: `SDS for ${productName} has been uploaded.`,
      });
      e.currentTarget.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "We could not upload the SDS document.",
      });
    } finally {
      setIsUploading(false);
    }
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
                disabled={isUploading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                placeholder="e.g., Chemical Corp"
                disabled={isUploading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sdsFile">SDS File (PDF)</Label>
              <Input
                id="sdsFile"
                name="sdsFile"
                type="file"
                accept=".pdf"
                disabled={isUploading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isUploading}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload SDS"}
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
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading SDS documents…
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                sdsDocuments.map((doc) => (
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
              {!loading && sdsDocuments.length === 0 && (
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
