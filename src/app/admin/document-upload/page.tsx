
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { uploadDocumentAction } from "./actions";
import LoadingDots from "@/components/ui/loading-dots";
import { Combobox } from "@/components/ui/combobox";


const formSchema = z.object({
    category: z.string().min(1, "Category is required."),
    section: z.string().min(1, "Section is required."),
    documentName: z.string().min(1, "Document name is required."),
    document: z.instanceof(File).refine(file => file.size > 0, "A file is required."),
});

// In a real app, this would be fetched from a database
const existingSections = [
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
].map(s => ({ value: s.toLowerCase().replace(/ /g, '-'), label: s }));

export default function DocumentUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      section: "",
      documentName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("section", values.section);
    formData.append("documentName", values.documentName);
    formData.append("document", values.document);

    const response = await uploadDocumentAction(formData);

    setIsLoading(false);

    if (response.success) {
      toast({
        title: "Upload Successful",
        description: `${values.document.name} has been processed.`,
      });
      form.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: response.error,
        });
    }
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a main category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Quality">Quality</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Environment">Environment</SelectItem>
                            <SelectItem value="Toolbox Talks">Toolbox Talks</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Section</FormLabel>
                             <Combobox 
                                options={existingSections}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select or create a section..."
                                notFoundText="No sections found. Create a new one."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="documentName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Site Supervisor Appointment" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="document"
                    render={({ field: { onChange, ...fieldProps } }) => (
                        <FormItem>
                        <FormLabel>Document File</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                {...fieldProps}
                                value={undefined}
                                onChange={e => onChange(e.target.files?.[0])}
                                accept=".doc,.docx,.pdf,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoadingDots /> : <Upload className="mr-2 h-4 w-4" />} 
                    Upload Document
                </Button>
            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
