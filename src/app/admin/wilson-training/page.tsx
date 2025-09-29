
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
import { indexDocumentAction } from "./actions";

// This would be fetched from a database in a real application.
const existingDocs: { name: string; type: string; size: string }[] = [];


export default function WilsonTrainingPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const dataUriFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!files || files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please select one or more files to upload.",
      });
      return;
    }
    
    setIsIndexing(true);
    let totalChunks = 0;
    let filesIndexed = 0;
    
    for(const file of Array.from(files)) {
      try {
        const documentDataUri = await dataUriFromFile(file);
        const response = await indexDocumentAction({ documentDataUri });

        if (response.success && response.data) {
          totalChunks += response.data.chunksIndexed;
          filesIndexed++;
        } else {
          throw new Error(response.error || 'Unknown error during indexing');
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: `Error Indexing ${file.name}`,
          description: error.message,
        });
      }
    }
    
    setIsIndexing(false);

    if (filesIndexed > 0) {
        toast({
            title: "Indexing Complete",
            description: `${filesIndexed} document(s) indexed into ${totalChunks} chunks. Wilson's knowledge base is updated.`,
        });
    }

    // Reset form
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
          permanent knowledge base. This will store them in a vector database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Reference Documents (PDF, JSON, Text)</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} multiple accept=".pdf,.json,.txt,.md" />
          </div>
          <Button type="submit" className="w-full" disabled={isIndexing}>
            {isIndexing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            {isIndexing ? 'Indexing...' : 'Upload & Index'}
          </Button>
        </form>
      </CardContent>
    </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Knowledge Base</CardTitle>
          <CardDescription>
            List of documents Wilson currently references. (Note: In-memory only)
          </CardDescription>
        </CardHeader>
        <CardContent>
            {existingDocs.length > 0 ? (
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
            ) : (
                <div className="flex h-20 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">Knowledge base is currently empty.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
