
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !category || !subCategory) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file, category, and sub-category.",
      });
      return;
    }
    // In a real app, this would handle the file upload to a server/cloud storage.
    console.log("Uploading file:", file.name, "to", category, "/", subCategory);
    toast({
      title: "Upload Successful",
      description: `${file.name} has been uploaded.`,
    });

    // Reset form
    setFile(null);
    setCategory("");
    setSubCategory("");
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Upload to Document Library</CardTitle>
        <CardDescription>
          Add new documents to the centralized library.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Document File</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
          <div className="grid gap-2">
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
          <div className="grid gap-2">
            <Label htmlFor="sub-category">Sub-Category</Label>
            <Input
              id="sub-category"
              placeholder="e.g., Procedures, Forms, Policies"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
