import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, File, FileText } from "lucide-react";

const documentCategories = [
  {
    category: "Safety",
    documents: [
      {
        name: "General Safety Induction.docx",
        subCategory: "Inductions",
        version: "2.1",
        lastUpdated: "2024-05-15",
        type: "word",
      },
      {
        name: "Working at Heights Procedure.docx",
        subCategory: "Procedures",
        version: "1.5",
        lastUpdated: "2024-04-22",
        type: "word",
      },
      {
        name: "Confined Space Entry Permit.docx",
        subCategory: "Permits",
        version: "3.0",
        lastUpdated: "2024-05-30",
        type: "word",
      },
      {
        name: "Incident Investigation Report Form.docx",
        subCategory: "Forms",
        version: "1.2",
        lastUpdated: "2023-11-10",
        type: "word",
      },
      {
        name: "Site Emergency Plan.docx",
        subCategory: "Plans",
        version: "4.2",
        lastUpdated: "2024-06-01",
        type: "word",
      },
    ],
  },
  {
    category: "Quality",
    documents: [
      {
        name: "Quality Assurance Plan.docx",
        subCategory: "Plans",
        version: "1.0",
        lastUpdated: "2024-01-20",
        type: "word",
      },
      {
        name: "Non-Conformance Report.docx",
        subCategory: "Forms",
        version: "1.1",
        lastUpdated: "2024-03-15",
        type: "word",
      },
    ],
  },
  {
    category: "HR",
    documents: [
      {
        name: "Employee Handbook.docx",
        subCategory: "Policies",
        version: "3.0",
        lastUpdated: "2024-01-01",
        type: "word",
      },
      {
        name: "Leave Application Form.docx",
        subCategory: "Forms",
        version: "1.5",
        lastUpdated: "2023-09-01",
        type: "word",
      },
    ],
  },
  {
    category: "Environment",
    documents: [
      {
        name: "Environmental Management Plan.docx",
        subCategory: "Plans",
        version: "1.8",
        lastUpdated: "2024-02-10",
        type: "word",
      },
      {
        name: "Waste Disposal Procedure.docx",
        subCategory: "Procedures",
        version: "1.2",
        lastUpdated: "2024-04-05",
        type: "word",
      },
    ],
  },
  {
    category: "Toolbox Talks",
    documents: [
      {
        name: "Hand and Power Tool Safety.pdf",
        subCategory: "Safety Briefings",
        version: "1.0",
        lastUpdated: "2024-05-10",
        type: "pdf",
      },
      {
        name: "Electrical Safety Awareness.pdf",
        subCategory: "Safety Briefings",
        version: "1.1",
        lastUpdated: "2024-06-15",
        type: "pdf",
      },
    ],
  },
];

const DocumentIcon = ({ type }: { type: string }) => {
  if (type === "pdf") {
    return <FileText className="h-4 w-4 text-red-600" />;
  }
  return <File className="h-4 w-4 text-blue-600" />;
};


export default function DocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Library</CardTitle>
        <CardDescription>
          Centralized storage for safety, health, environment, and quality
          documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {documentCategories.map((category, index) => (
            <AccordionItem value={`item-${index}`} key={category.category}>
              <AccordionTrigger className="text-lg font-medium">
                {category.category}
              </AccordionTrigger>
              <AccordionContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.documents.map((doc) => (
                      <TableRow key={doc.name}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <DocumentIcon type={doc.type} />
                          {doc.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{doc.subCategory}</Badge>
                        </TableCell>
                        <TableCell>{doc.version}</TableCell>
                        <TableCell>{doc.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            {/* In a real app, this would link to a file download */}
                            <a href="#" download={doc.name}>
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download</span>
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
