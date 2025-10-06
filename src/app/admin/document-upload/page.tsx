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
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import LoadingDots from "@/components/ui/loading-dots";
import { Progress } from "@/components/ui/progress";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BASE_ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const WORD_FILE_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const createUploadSchema = (allowedFileTypes: string[]) =>
  z.object({
    category: z.string().min(1, "Category is required"),
    section: z.string().min(3, "Section must be at least 3 characters"),
    documentName: z
      .string()
      .min(3, "Document name must be at least 3 characters"),
    document: z
      .custom<FileList>((files) => files instanceof FileList, {
        message: "A file must be selected.",
      })
      .refine((files) => files.length === 1, "A file must be selected.")
      .refine(
        (files) => files.item(0)?.size ?? 0 <= MAX_FILE_SIZE_BYTES,
        `File size must be less than ${MAX_FILE_SIZE_MB}MB.`
      )
      .refine(
        (files) =>
          !!files.item(0) &&
          allowedFileTypes.includes(files.item(0)?.type ?? ""),
        "Invalid file type. Only supported document formats are allowed."
      ),
  });

type UploadFormValues = z.infer<ReturnType<typeof createUploadSchema>>;

export default function DocumentUploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAdmin = user?.role === "admin";

  // Mock data, as we removed the backend data fetching
  const allDocs: any[] = useMemo(() => [], []);

  const allowedFileTypes = useMemo(() => {
    const types = [...BASE_ALLOWED_FILE_TYPES];
    if (isAdmin) {
      types.push(...WORD_FILE_TYPES);
    }
    return types;
  }, [isAdmin]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router, user]);

  const uploadSchema = useMemo(
    () => createUploadSchema(allowedFileTypes),
    [allowedFileTypes]
  );

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
        .filter((doc) => doc.category === category)
        .map((doc) => doc.section)
    );
    return Array.from(uniqueSections);
  }, [allDocs, category]);

  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true);
    setUploadProgress(0);

    const file = values.document.item(0);

    if (!file) {
      toast({
        variant: "destructive",
        title: "No file attached",
        description: "Please choose a document to upload before submitting.",
      });
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("section", values.section);
    formData.append("documentName", values.documentName);
    formData.append("document", file);

    try {
      // Simulate progress for a better UX, but the actual upload will happen in fetch
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : 90));
      }, 500);

      const response = await fetch("/api/document-upload", {
        method: "POST",
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
        description: `${file.name} has been processed.`,
      });
      form.reset();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description:
          error?.message || "An unknown error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <LoadingDots />
        <p>Verifying your administrator permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload files with category and section for management. Excel and PDF
            formats are available, and Microsoft Word uploads are reserved for
            administrators.
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
                          accept={allowedFileTypes.join(",")}
                          onChange={(event) =>
                            field.onChange(
                              event.target.files ?? new DataTransfer().files
                            )
                          }
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
