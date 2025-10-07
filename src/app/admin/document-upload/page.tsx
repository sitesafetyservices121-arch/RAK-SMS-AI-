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
import { useAuth } from "@/hooks/use-auth";
import LoadingDots from "@/components/ui/loading-dots";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/firebase-client";
import { collection, onSnapshot } from "firebase/firestore";

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
  documentName: z.string().min(3, "Document name must be at least 3 characters"),
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

type ExistingDocument = {
  id: string;
  category: string;
  section: string;
};

export default function DocumentUploadPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [existingDocs, setExistingDocs] = useState<ExistingDocument[]>([]);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    const documentsRef = collection(db, "documents");
    const unsubscribe = onSnapshot(
      documentsRef,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data() as { category?: unknown; section?: unknown };
          return {
            id: doc.id,
            category: typeof data.category === "string" ? data.category : "General",
            section: typeof data.section === "string" ? data.section : "General",
          } satisfies ExistingDocument;
        });

        setExistingDocs(docs);
        setMetadataError(null);
      },
      (error) => {
        console.error("Failed to fetch existing document metadata", error);
        setMetadataError("Sections could not be loaded. You can still type a new section name.");
        setExistingDocs([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: "",
      section: "",
      documentName: "",
      document: undefined,
    },
  });

  const category = form.watch("category");

  const sections = useMemo(() => {
    if (!category) return [] as string[];
    const uniqueSections = new Set(
      existingDocs
        .filter((doc) => doc.category === category)
        .map((doc) => doc.section)
    );
    return Array.from(uniqueSections).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [existingDocs, category]);

  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("section", values.section);
    formData.append("documentName", values.documentName);
    formData.append("document", values.document[0]);

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : 90));
      }, 500);

      const response = await fetch("/api/document-upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (progressInterval) {
        clearInterval(progressInterval);
      }

      if (!response.ok || !payload?.success) {
        const errorMessage = payload?.error ?? `Upload failed with status ${response.status}.`;
        throw new Error(errorMessage);
      }

      setUploadProgress(100);
      toast({
        title: "Document uploaded",
        description: `${values.documentName} has been added to the ${values.category} library.`,
      });
      form.reset();
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setUploadProgress(0);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during upload.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const formDisabled = authLoading || isUploading || !isAdmin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload files with category and section for management. Word, Excel, and PDF formats are accepted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isAdmin ? (
                <p className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-sm text-muted-foreground">
                  You need an administrator account to upload documents. Sign in with an admin user to enable this form.
                </p>
              ) : null}
              <fieldset disabled={formDisabled} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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
                        {sections.map((sectionName) => (
                          <option key={sectionName} value={sectionName} />
                        ))}
                      </datalist>
                      {metadataError ? (
                        <p className="text-sm text-muted-foreground">{metadataError}</p>
                      ) : null}
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
                        <Input placeholder="A descriptive name for the document" {...field} />
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
                          onChange={(event) => field.onChange(event.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isUploading ? <Progress value={uploadProgress} className="w-full" /> : null}
                <Button type="submit" disabled={isUploading || authLoading} className="flex gap-2">
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
