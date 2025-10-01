"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import mammoth from "mammoth";
import { db } from "@/lib/firebase-client";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

export function WordToPdfUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a Word document
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' // .doc
      ];
      
      if (!validTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a Word document (.doc or .docx)",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and ensure you're logged in",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Convert Word document to HTML
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const htmlContent = result.value;

      // Add some styling to the HTML
      const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { color: #1e40af; margin-top: 20px; }
            h2 { color: #3b82f6; margin-top: 16px; }
            h3 { color: #60a5fa; margin-top: 12px; }
            p { margin: 10px 0; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;

      // Generate filename without extension
      const fileName = selectedFile.name.replace(/\.(docx?|DOCX?)$/, '');
      const pdfFileName = `${fileName}-${Date.now()}.pdf`;

      // Create document in pdfRequests collection
      const docRef = await addDoc(collection(db, "pdfRequests"), {
        template: 'default',
        html: styledHtml,
        fileName: pdfFileName,
        userId: user.uid,
        documentType: "uploaded-document",
        originalFileName: selectedFile.name,
        createdAt: new Date(),
        status: "pending"
      });

      toast({
        title: "Upload Successful",
        description: `Your document is being converted to PDF. It will appear in Generated Documents.`,
      });

      // Reset form
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to process the Word document",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Word Document</CardTitle>
        <CardDescription>
          Upload a Word document (.doc or .docx) to convert it to a PDF, which will be available in the 'Generated Documents' section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select Document</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm flex-1">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </span>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting to PDF...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Convert to PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
