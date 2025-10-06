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
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import LoadingDots from "@/components/ui/loading-dots";
import { Progress } from "@/components/ui/progress";


const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const uploadSchema = z.object({
  category: z.string().min(1, "Category is required"),
  section: z.string().min(3, "Section must be at least 3 characters"),
  documentName: z
    .string()
    .min(3, "Document name must be at least 3 characters"),
  document: z
    .any()
    .refine((files) => files?.length === 1, "A file must be selected.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES,
      `File size must be less than ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
      (files) => ALLOWED_FILE_TYPES.includes(files?.[0]?.type),
      "Invalid file type. Only PDF, Word, or Excel files are allowed."
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function DocumentUploadPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Mock data, as we removed the backend data fetching
  const allDocs = useMemo(() => [], []);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: "",
      section: "",
      documentName: "",
      document: undefined,
    },
  });

  const { watch } = form;
  const category = watch("category");


  const sections = useMemo(() => {
    const uniqueSections = new Set(
      allDocs
        .filter((doc: any) => doc.category === category)
        .map((doc: any) => doc.section)
    );
    return Array.from(uniqueSections);
  }, [allDocs, category]);

  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("section", values.section);
    formData.append("documentName", values.documentName);
    formData.append("document", values.document[0]);

    try {
      // Simulate progress for a better UX, but the actual upload will happen in fetch
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : 90));
      }, 500);

      const response = await fetch('/api/document-upload', {
          method: 'POST',
          body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Upload Successful",
        description: `${values.document[0].name} has been processed.`,
      });
      form.reset();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error.message || "An unknown error occurred during upload.",
        });
    } finally {
        setIsUploading(false);
        setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload files with category and section for management. Word, Excel,
            and PDF formats are accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <fieldset
                disabled={authLoading || isUploading}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Safety">Safety</SelectItem>
                          <SelectItem value="Quality">Quality</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Environment">
                            Environment
                          </SelectItem>
                          <SelectItem value="Toolbox Talks">
                            Toolbox Talks
                          </SelectItem>
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
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Risk Assessments"
                          {...field}
                          list="section-suggestions"
                        />
                      </FormControl>
                      <datalist id="section-suggestions">
                        {sections.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
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
                          placeholder="A descriptive name for the document"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept={ALLOWED_FILE_TYPES.join(",")}
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isUploading && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
                <Button
                  type="submit"
                  disabled={isUploading || authLoading}
                  className="flex gap-2"
                >
                  {isUploading ? (
                    <>
                      <LoadingDots />
                      <span>{`Uploading... (${uploadProgress}%)`}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" /> Upload Document
                    </>
                  )}
                </Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
