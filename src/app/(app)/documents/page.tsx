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
import { Download, FileType } from "lucide-react";

const documents = [
  {
    name: "General Safety Induction.docx",
    category: "Inductions",
    version: "2.1",
    lastUpdated: "2024-05-15",
  },
  {
    name: "Working at Heights Procedure.docx",
    category: "Procedures",
    version: "1.5",
    lastUpdated: "2024-04-22",
  },
  {
    name: "Confined Space Entry Permit.docx",
    category: "Permits",
    version: "3.0",
    lastUpdated: "2024-05-30",
  },
  {
    name: "Incident Investigation Report Form.docx",
    category: "Forms",
    version: "1.2",
    lastUpdated: "2023-11-10",
  },
  {
    name: "Site Emergency Plan.docx",
    category: "Plans",
    version: "4.2",
    lastUpdated: "2024-06-01",
  },
  {
    name: "Q1 2024 Safety Committee Minutes.docx",
    category: "Meetings",
    version: "1.0",
    lastUpdated: "2024-03-28",
  },
];

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileType className="h-4 w-4 text-muted-foreground" />
                  {doc.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{doc.category}</Badge>
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
      </CardContent>
    </Card>
  );
}
