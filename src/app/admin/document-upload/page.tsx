
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import LoadingDots from "@/components/ui/loading-dots";
import { Combobox } from "@/components/ui/combobox";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z.object({
  category: z.string().min(1, "Category is required."),
  section: z.string().min(1, "Section is required."),
  documentName: z.string().min(1, "Document name is required."),
  document: z
    .instanceof(File)
    .refine((file) => file?.size > 0, "A file is required.")
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE_BYTES,
      `File size must be less than ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file?.type),
      "Invalid file type. Only PDF, Word, or Excel files are allowed."
    ),
});

type DocumentUploadFormValues = z.infer<typeof formSchema>;

type SectionOption = { value: string; label: string };

export default function DocumentUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingSections, setExistingSections] = useState<SectionOption[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSections() {
      const response = await fetch("/api/document-sections");
      const result = await response.json();
      if (result.success && result.data) {
        setExistingSections(result.data);
      }
    }
    fetchSections();
  }, []);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      section: "",
      documentName: "",
      document: undefined,
    },
  });

  const onSubmit = async (values: DocumentUploadFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to upload documents.",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("section", values.section);
    formData.append("documentName", values.documentName);
    formData.append("document", values.document);

    const token = await user.getIdToken();

    const response = await fetch("/api/document-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Upload Successful",
        description: `${values.document.name} has been processed.`,
      });
      form.reset();
      
      const newSectionValue = values.section.toLowerCase().replace(/ /g, "-");
      if (!existingSections.some((s) => s.value === newSectionValue)) {
        setExistingSections((prev) =>
          [...prev, { value: newSectionValue, label: values.section }].sort(
            (a, b) => a.label.localeCompare(b.label)
          )
        );
      }
    } else {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: result.error,
      });
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Upload to Document Library</CardTitle>
        <CardDescription>
          Add new documents to the centralized library in Firebase.
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    notFoundText="No sections found."
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
                    <Input
                      placeholder="e.g., Site Supervisor Appointment"
                      {...field}
                    />
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
                      {...fieldProps}
                      type="file"
                      accept=".doc,.docx,.pdf,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoadingDots />
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
