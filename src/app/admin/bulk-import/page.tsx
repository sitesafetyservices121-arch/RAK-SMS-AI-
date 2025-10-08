
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2, Import, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// This is a placeholder type. In a real app, this would involve unzipping logic.
type ExtractedFile = {
  id: string;
  name: string;
  type: string;
  size: number;
};

type FileImportState = {
  category: string;
  section: string;
  documentName: string;
};

export default function BulkImportPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [importState, setImportState] = useState<Record<string, FileImportState>>({});
  const { toast } = useToast();

  const handleFileProcess = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    // Simulate processing a ZIP file.
    // In a real implementation, you'd use a library like JSZip on the client
    // or a serverless function to handle this.
    setTimeout(() => {
      // Mock extracted files
      const mockFiles: ExtractedFile[] = [
        { id: "mock-1", name: "Risk Assessment - Site A.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 12845 },
        { id: "mock-2", name: "Emergency Evacuation Plan.pdf", type: "application/pdf", size: 345678 },
        { id: "mock-3", name: "Toolbox Talk - Slips and Falls.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 22345 },
        { id: "mock-4", name: "HR Policy - Annual Leave.pdf", type: "application/pdf", size: 98765 },
      ];
      setExtractedFiles(mockFiles);

      // Initialize state for each file
      const initialState: Record<string, FileImportState> = {};
      mockFiles.forEach(file => {
        initialState[file.id] = { category: "", section: "", documentName: file.name.split('.')[0] };
      });
      setImportState(initialState);
      
      setIsProcessing(false);
      toast({
        title: "File Processed",
        description: `${mockFiles.length} documents were extracted and are ready for import.`,
      });
    }, 2000);
  };

  const handleImport = (fileId: string) => {
    const fileDetails = importState[fileId];
    const file = extractedFiles.find(f => f.id === fileId);

    if (!fileDetails.category || !fileDetails.section || !fileDetails.documentName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out Category, Section, and Document Name before importing.",
      });
      return;
    }

    // Simulate import API call
    console.log(`Importing ${file?.name} with details:`, fileDetails);

    toast({
      title: "Import Successful",
      description: `${file?.name} has been imported into the document library.`,
    });

    // Remove the imported file from the list
    setExtractedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const handleStateChange = (fileId: string, field: keyof FileImportState, value: string) => {
    setImportState(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], [field]: value }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Document Import</CardTitle>
        <CardDescription>
          Upload a ZIP file containing multiple documents to import them in one go.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Step 1: Upload ZIP File</h3>
          <div className="p-6 border-2 border-dashed rounded-lg text-center bg-muted/50">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <Label htmlFor="bulk-upload" className="mt-4 block text-sm font-medium cursor-pointer text-primary hover:underline">
              {isProcessing ? "Processing file..." : "Click to upload a ZIP file"}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">Maximum file size: 50MB. ZIP only.</p>
            <Input
              id="bulk-upload"
              type="file"
              className="sr-only"
              accept=".zip"
              onChange={handleFileProcess}
              disabled={isProcessing}
            />
            {isProcessing && <Loader2 className="mx-auto mt-4 h-6 w-6 animate-spin" />}
          </div>
        </div>
        
        {extractedFiles.length > 0 && (
          <div>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold mb-2">Step 2: Categorize and Import</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For each document extracted from the ZIP file, assign a category, section, and final name, then click &apos;Import&apos;.
            </p>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Extracted File</TableHead>
                    <TableHead className="w-[180px]">Category</TableHead>
                    <TableHead className="w-[200px]">Section</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead className="text-right w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" /> 
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(val) => handleStateChange(file.id, 'category', val)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Quality">Quality</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Environment">Environment</SelectItem>
                            <SelectItem value="Toolbox Talks">Toolbox Talks</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                            placeholder="e.g., Risk Assessments" 
                            value={importState[file.id]?.section}
                            onChange={(e) => handleStateChange(file.id, 'section', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                            placeholder="Final document name" 
                            value={importState[file.id]?.documentName}
                            onChange={(e) => handleStateChange(file.id, 'documentName', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleImport(file.id)}>
                          <Import className="mr-2 h-4 w-4" /> Import
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
         { !isProcessing && extractedFiles.length === 0 && (
            <div className="mt-6 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="font-semibold">Ready for import</p>
                <p>Upload a ZIP file to begin.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
