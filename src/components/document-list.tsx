"use client";

import React, { useMemo, useState } from "react";
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

// Helper function to render a document icon based on its type
const DocumentIcon = ({ type }: { type?: string }) => {
  if (!type) return <File className="h-4 w-4 text-gray-400" />;
  if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-600" />;
  if (type.includes("spreadsheet") || type.includes("excel")) return <File className="h-4 w-4 text-green-600" />;
  if (type.includes("zip") || type.includes("cad")) return <File className="h-4 w-4 text-yellow-600" />;
  return <File className="h-4 w-4 text-blue-600" />;
};

const mockDocuments: Document[] = [
    { id: "1", name: "General Risk Assessment.pdf", category: "Safety", section: "Risk Assessments", subSection: "General", url: "#", type: "pdf", updatedAt: new Date() as any, version: '1' },
    { id: "2", name: "Working at Height Permit.docx", category: "Safety", section: "Permits", subSection: "Work Permits", url: "#", type: "docx", updatedAt: new Date() as any, version: '1' },
    { id: "3", name: "QMS Manual.pdf", category: "Quality", section: "Manuals", url: "#", type: "pdf", updatedAt: new Date() as any, version: '1' },
];

// DocumentList component to display documents for a specific category
export function DocumentList({ category }: { category: string }) {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const documents = mockDocuments.filter(doc => doc.category === category);

  const groupedBySection = useMemo(() => {
    return documents.reduce((acc, doc) => {
      (acc[doc.section] = acc[doc.section] || []).push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [documents]);
  

  if (documents.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4" />
        <p className="font-semibold">No Documents Found</p>
        <p className="text-sm">
          There are no documents in the &lsquo;{category}&rsquo; category.
        </p>
      </div>
    );
  }
  
  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openSections}
      onValueChange={setOpenSections}
      defaultValue={Object.keys(groupedBySection)}
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
                      <ul className="space-y-2 pt-2">
                        {subSectionDocs.map((doc) => (
                          <li key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <DocumentIcon type={doc.type} />
                              <span className="truncate">{doc.name}</span>
                            </div>
                            {(doc.status !== 'processing' && (doc.url || doc.downloadURL)) ? (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={doc.url || doc.downloadURL} target="_blank" rel="noopener noreferrer" download={doc.name}>
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </a>
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">{doc.status}...</span>
                            )}
                          </li>
                        ))}
                      </ul>
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
