"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, File, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Document } from "@/types/documents";
import LoadingDots from "@/components/ui/loading-dots";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from "@/lib/firebase-client";
import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

const DocumentIcon = ({ type }: { type?: string }) => {
  if (!type) return <File className="h-4 w-4 text-gray-400" />;
  if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-600" />;
  if (type.includes("spreadsheet") || type.includes("excel")) return <File className="h-4 w-4 text-green-600" />;
  if (type.includes("zip") || type.includes("cad")) return <File className="h-4 w-4 text-yellow-600" />;
  return <File className="h-4 w-4 text-blue-600" />;
};

const coerceTimestamp = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (typeof value === "object" && value !== null && "seconds" in value && "nanoseconds" in value) {
    const seconds = Number((value as { seconds: number }).seconds);
    const nanoseconds = Number((value as { nanoseconds: number }).nanoseconds);
    if (!Number.isNaN(seconds) && !Number.isNaN(nanoseconds)) {
      return new Timestamp(seconds, nanoseconds);
    }
  }
  return Timestamp.now();
};

export function DocumentList({ category }: { category: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const documentsRef = collection(db, "documents");
    const documentsQuery = query(documentsRef, where("category", "==", category));

    const unsubscribe = onSnapshot(
      documentsQuery,
      (snapshot) => {
        const nextDocuments: Document[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<Document> & {
            createdAt?: unknown;
            updatedAt?: unknown;
            lastUpdated?: unknown;
            documentName?: unknown;
            subsection?: unknown;
          };

          return {
            id: docSnap.id,
            name: (data.name as string) ?? (data.documentName as string) ?? docSnap.id,
            category: (data.category as string) ?? category,
            section: (data.section as string) ?? "General",
            subSection: (data.subSection as string) ?? (data.subsection as string) ?? undefined,
            version: (data.version as string) ?? "1.0",
            updatedAt: coerceTimestamp(data.updatedAt ?? data.lastUpdated ?? data.createdAt),
            type: data.type as string | undefined,
            downloadURL: (data.downloadURL as string | undefined) ?? (data.url as string | undefined),
            url: data.url as string | undefined,
            fileName: data.fileName as string | undefined,
            status: data.status as string | undefined,
            companyId: data.companyId as string | undefined,
          } satisfies Document;
        });

        nextDocuments.sort((a, b) => {
          const sectionCompare = a.section.localeCompare(b.section, undefined, { sensitivity: "base" });
          if (sectionCompare !== 0) return sectionCompare;
          const subSectionA = a.subSection ?? "";
          const subSectionB = b.subSection ?? "";
          const subCompare = subSectionA.localeCompare(subSectionB, undefined, { sensitivity: "base" });
          if (subCompare !== 0) return subCompare;
          return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });

        setDocuments(nextDocuments);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load documents", snapshotError);
        setError("We couldn’t load documents for this category right now. Please try again later.");
        setDocuments([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category]);

  const groupedBySection = useMemo(() => {
    return documents.reduce((acc, doc) => {
      (acc[doc.section] = acc[doc.section] || []).push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [documents]);

  useEffect(() => {
    const sections = Object.keys(groupedBySection);
    setOpenSections((previous) => {
      const previousSignature = previous.join("|");
      const nextSignature = sections.join("|");
      if (previousSignature === nextSignature) {
        return previous;
      }
      return sections;
    });
  }, [groupedBySection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load documents</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <FileText className="mx-auto mb-4 h-12 w-12" />
        <p className="font-semibold">No Documents Found</p>
        <p className="text-sm">There are no documents in the &apos;{category}&apos; category.</p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openSections}
      onValueChange={setOpenSections}
    >
      {Object.entries(groupedBySection).map(([section, sectionDocs]) => {
        const groupedBySubSection = sectionDocs.reduce((acc, doc) => {
          const subSection = doc.subSection || "General";
          (acc[subSection] = acc[subSection] || []).push(doc);
          return acc;
        }, {} as Record<string, Document[]>);

        return (
          <AccordionItem value={section} key={section}>
            <AccordionTrigger className="text-lg font-semibold">{section}</AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" className="w-full pl-4" defaultValue={Object.keys(groupedBySubSection)}>
                {Object.entries(groupedBySubSection).map(([subSection, subSectionDocs]) => (
                  <AccordionItem value={subSection} key={subSection}>
                    <AccordionTrigger>{subSection}</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-2/5">Document</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="w-24 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subSectionDocs.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <DocumentIcon type={doc.type} />
                                  <span className="truncate">{doc.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{doc.version ?? "1.0"}</TableCell>
                              <TableCell>
                                {doc.updatedAt
                                  ? new Date(doc.updatedAt.toMillis()).toLocaleDateString()
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                {doc.status !== "processing" && (doc.downloadURL || doc.url) ? (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={doc.downloadURL || doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={doc.fileName ?? doc.name}
                                    >
                                      <Download className="mr-2 h-4 w-4" /> Download
                                    </a>
                                  </Button>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {doc.status ? `${doc.status}...` : "Processing..."}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
