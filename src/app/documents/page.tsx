
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
        name: "Company SHEQ Policy Statement.docx",
        subCategory: "Safety Policy & Objectives",
        version: "3.0",
        lastUpdated: "2024-01-15",
        type: "word",
      },
      {
        name: "Annual Safety Objectives.docx",
        subCategory: "Safety Policy & Objectives",
        version: "2024.1",
        lastUpdated: "2024-02-01",
        type: "word",
      },
      {
        name: "OHS Act No. 85 of 1993 Summary.pdf",
        subCategory: "Legal & Compliance Framework",
        version: "1.0",
        lastUpdated: "2023-11-20",
        type: "pdf",
      },
      {
        name: "COID Act Summary.pdf",
        subCategory: "Legal & Compliance Framework",
        version: "1.0",
        lastUpdated: "2023-11-20",
        type: "pdf",
      },
      {
        name: "Construction Regulations 2014.pdf",
        subCategory: "Legal & Compliance Framework",
        version: "1.2",
        lastUpdated: "2024-03-05",
        type: "pdf",
      },
      {
        name: "Baseline Risk Assessment Template.docx",
        subCategory: "Risk Management",
        version: "2.1",
        lastUpdated: "2024-02-15",
        type: "word",
      },
      {
        name: "HIRA Template.docx",
        subCategory: "Risk Management",
        version: "2.5",
        lastUpdated: "2024-03-10",
        type: "word",
      },
      {
        name: "SWP - Working at Heights.docx",
        subCategory: "Safe Work Procedures (SWPs)",
        version: "1.8",
        lastUpdated: "2024-04-22",
        type: "word",
      },
      {
        name: "SWP - Confined Space Entry.docx",
        subCategory: "Safe Work Procedures (SWPs)",
        version: "1.6",
        lastUpdated: "2024-05-30",
        type: "word",
      },
      {
        name: "Method Statement - Crane Lifting.docx",
        subCategory: "Method Statements",
        version: "1.3",
        lastUpdated: "2024-06-10",
        type: "word",
      },
      {
        name: "Site Emergency Response Plan.docx",
        subCategory: "Emergency Preparedness & Response",
        version: "4.2",
        lastUpdated: "2024-06-01",
        type: "word",
      },
      {
        name: "Fire Evacuation Drill Record.docx",
        subCategory: "Emergency Preparedness & Response",
        version: "1.0",
        lastUpdated: "2024-05-20",
        type: "word",
      },
      {
        name: "Incident Report Form.docx",
        subCategory: "Incident & Accident Reporting",
        version: "2.0",
        lastUpdated: "2023-11-10",
        type: "word",
      },
      {
        name: "First Aid Needs Assessment.docx",
        subCategory: "First Aid & Medical Surveillance",
        version: "1.1",
        lastUpdated: "2024-02-28",
        type: "word",
      },
      {
        name: "PPE Policy.docx",
        subCategory: "PPE Management",
        version: "2.0",
        lastUpdated: "2024-01-25",
        type: "word",
      },
      {
        name: "PPE Issue Register Form.docx",
        subCategory: "PPE Management",
        version: "1.5",
        lastUpdated: "2023-12-01",
        type: "word",
      },
      {
        name: "Company Training Matrix.xlsx",
        subCategory: "Training & Competency Records",
        version: "2024",
        lastUpdated: "2024-06-20",
        type: "excel", // Note: A different icon might be needed for this
      },
      {
        name: "General Safety Induction Record.docx",
        subCategory: "Training & Competency Records",
        version: "1.0",
        lastUpdated: "2024-05-15",
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
  // Added a case for excel, can be expanded for other types
  if (type === "excel") {
    return <File className="h-4 w-4 text-green-600" />;
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
        <Tabs defaultValue={documentCategories[0].category}>
          <TabsList className="grid w-full grid-cols-5">
            {documentCategories.map((category) => (
              <TabsTrigger value={category.category} key={category.category}>
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>
          {documentCategories.map((category) => (
            <TabsContent value={category.category} key={category.category}>
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
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
