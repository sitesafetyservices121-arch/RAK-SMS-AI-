
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
import { UploadCloud, FileJson, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock data for existing reference documents
const existingDocs = [
    { name: "OHS Act 85 of 1993.pdf", type: "PDF", size: "2.1 MB" },
    { name: "COID Act Amendment 2023.pdf", type: "PDF", size: "850 KB" },
    { name: "Construction Regulations 2014.json", type: "JSON", size: "1.2 MB" },
];

export default function WilsonTrainingPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!files || files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select one or more files to upload.",
      });
      return;
    }
    // In a real app, this would handle the file upload to a permanent storage bucket.
    // The AI flow would then be configured to use a retriever on this bucket.
    console.log("Uploading files for AI training:", Array.from(files).map(f => f.name));
    toast({
      title: "Upload Successful",
      description: `${files.length} document(s) have been added to Wilson's knowledge base.`,
    });

    // Reset form - ideally you would also refresh the list of documents
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
    setFiles(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>AI Reference Documents</CardTitle>
        <CardDescription>
          Upload PDF or JSON files containing acts and regulations for Wilson&apos;s
          permanent knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Reference Documents (PDF, JSON)</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} multiple accept=".pdf,.json" />
          </div>
          <Button type="submit" className="w-full">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload to Knowledge Base
          </Button>
        </form>
      </CardContent>
    </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Knowledge Base</CardTitle>
          <CardDescription>
            List of documents Wilson currently references.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {existingDocs.map(doc => (
                <li key={doc.name} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                        {doc.type === 'PDF' ? <FileText className="h-5 w-5 text-red-500" /> : <FileJson className="h-5 w-5 text-blue-500" />}
                        <span className="font-medium">{doc.name}</span>
                    </div>
                    <Badge variant="outline">{doc.size}</Badge>
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
