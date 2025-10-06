"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileJson, FileText, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { IndexDocumentResponse } from "@/types/wilson-training";
import { indexDocumentAction } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock database (would be fetched in real app)
const existingDocs: { name: string; type: string; size: string }[] = [];

export default function WilsonTrainingPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState(existingDocs);
  const [category, setCategory] = useState("");
  const [section, setSection] = useState("");
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please choose a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category Missing",
        description: "Please select a category for the document.",
        variant: "destructive",
      });
      return;
    }

    if (!section) {
      toast({
        title: "Section Missing",
        description: "Please enter a section for the document.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();

        reader.onloadend = async () => {
          try {
            const input = {
              documentDataUri: reader.result as string,
              category,
              section,
              fileName: file.name,
            };

            const response: IndexDocumentResponse =
              await indexDocumentAction(input);

            if (response.success) {
              setIndexedDocs((prev) => [
                ...prev,
                {
                  name: file.name,
                  type: file.type,
                  size: `${(file.size / 1024).toFixed(2)} KB`,
                },
              ]);

              toast({
                title: "Document Indexed",
                description: `${file.name} successfully indexed with ${response.data.chunksIndexed} chunks.`,
              });
            } else {
              toast({
                title: "Indexing Failed",
                description: (response as { success: false; error: string }).error,
                variant: "destructive",
              });
            }
          } catch (err) {
            console.error(err);
            toast({
              title: "Unexpected Error",
              description: "Something went wrong while indexing.",
              variant: "destructive",
            });
          }
        };

        reader.readAsDataURL(file);
      }
    } finally {
      setUploading(false);
      setFiles(null);
      setCategory("");
      setSection("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wilson Training</CardTitle>
          <CardDescription>
            Upload and index documents for training Wilson AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Form */}
          <div className="space-y-4">
            <Label htmlFor="file">Upload Documents</Label>
            <Input
              id="file"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Toolbox Talks">Toolbox Talks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                type="text"
                placeholder="e.g., Risk Assessments"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading || !files || !category || !section}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload & Index
                </>
              )}
            </Button>
          </div>

          {/* Indexed Documents */}
          <div>
            <h3 className="text-sm font-medium mb-2">Indexed Documents</h3>
            {indexedDocs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No documents have been indexed yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {indexedDocs.map((doc, i) => (
                  <li
                    key={`${doc.name}-${i}`}
                    className="flex items-center justify-between border rounded-md p-2"
                  >
                    <div className="flex items-center gap-2">
                      {doc.type.includes("json") ? (
                        <FileJson className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span>{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{doc.size}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
