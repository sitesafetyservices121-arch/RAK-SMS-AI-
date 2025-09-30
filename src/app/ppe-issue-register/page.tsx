
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, PlusCircle, Save } from "lucide-react";
import { initialEmployees, ppeRegister as initialPpeRegister, type Employee } from "@/lib/employee-data";
import { format, addMonths } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

type PpeItem = {
    id: string;
    name: string;
    category: string;
};

type PpeRegisterEntry = {
    employeeId: string;
    ppeItemId: string;
    dateIssued: string;
    validUntil: string;
    signature: "Signed" | "Pending";
};

const ppeItems: PpeItem[] = [
    { id: 'ppe-hd-01', name: 'Hard Hat', category: 'Head Protection' },
    { id: 'ppe-hg-01', name: 'Safety Gloves (Leather)', category: 'Hand Protection' },
    { id: 'ppe-hg-02', name: 'Safety Gloves (Chemical)', category: 'Hand Protection' },
    { id: 'ppe-ft-01', name: 'Safety Boots', category: 'Foot Protection' },
    { id: 'ppe-ey-01', name: 'Safety Goggles', category: 'Eye Protection' },
    { id: 'ppe-ey-02', name: 'Face Shield', category: 'Eye Protection' },
    { id: 'ppe-bd-01', name: 'Reflective Vest', category: 'Body Protection' },
    { id: 'ppe-bd-02', name: 'Harness', category: 'Body Protection' },
];

export default function PpeIssueRegisterPage() {
  const [register, setRegister] = useState<PpeRegisterEntry[]>(initialPpeRegister);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const { toast } = useToast();

  const employeeMap = useMemo(() => new Map(initialEmployees.map(e => [e.id, `${e.firstName} ${e.surname}`])), []);
  const ppeItemMap = useMemo(() => new Map(ppeItems.map(item => [item.id, item.name])), []);

  const handleIssuePpe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const employeeId = formData.get("employeeId") as string;
    const ppeItemId = formData.get("ppeItemId") as string;
    const validityMonths = parseInt(formData.get("validity") as string);
    const issueDate = new Date();
    
    // Check for re-issue warning
    const lastIssue = register
        .filter(entry => entry.employeeId === employeeId && entry.ppeItemId === ppeItemId)
        .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())[0];

    if (lastIssue && new Date() < new Date(lastIssue.validUntil)) {
        toast({
            variant: "destructive",
            title: "Warning: Early Re-issue",
            description: `This item was issued on ${format(new Date(lastIssue.dateIssued), "PPP")} and is valid until ${format(new Date(lastIssue.validUntil), "PPP")}.`,
        });
        return; // Stop the issue process
    }

    const newEntry: PpeRegisterEntry = {
        employeeId,
        ppeItemId,
        dateIssued: issueDate.toISOString().split('T')[0],
        validUntil: addMonths(issueDate, validityMonths).toISOString().split('T')[0],
        signature: "Signed", // Assuming signature is captured
    };

    setRegister(prev => [...prev, newEntry].sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()));
    toast({ title: "PPE Issued", description: `${ppeItemMap.get(ppeItemId)} issued to ${employeeMap.get(employeeId)}.` });
    setIsIssueOpen(false);
  }

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("PPE Issue Register Report", 14, 15);

    const tableData = register.map(entry => [
        employeeMap.get(entry.employeeId) || entry.employeeId,
        ppeItemMap.get(entry.ppeItemId) || entry.ppeItemId,
        entry.dateIssued,
        entry.validUntil,
        entry.signature,
    ]);

    (doc as any).autoTable({
        head: [['Employee', 'PPE Item', 'Date Issued', 'Valid Until', 'Signature']],
        body: tableData,
        startY: 20,
    });
    
    doc.save("PPE_Issue_Register.pdf");
  }

  const handleSaveToGenerated = () => {
    // In a real app, this would save the PDF to cloud storage
    toast({
        title: "Report Saved",
        description: "The PPE Issue Register has been saved to Generated Documents."
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PPE Issue Register</CardTitle>
            <CardDescription>
              Track the issuance of Personal Protective Equipment to employees.
            </CardDescription>
          </div>
          <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Issue PPE</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Issue New PPE</DialogTitle></DialogHeader>
                <form onSubmit={handleIssuePpe} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee</Label>
                        <Select name="employeeId" required><SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
                            <SelectContent>{initialEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.surname}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ppeItemId">PPE Item</Label>
                        <Select name="ppeItemId" required><SelectTrigger><SelectValue placeholder="Select PPE item" /></SelectTrigger>
                            <SelectContent>{ppeItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name} ({item.category})</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="validity">Validity Period</Label>
                        <Select name="validity" required><SelectTrigger><SelectValue placeholder="Select validity period" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6 Months</SelectItem>
                                <SelectItem value="12">12 Months</SelectItem>
                                <SelectItem value="24">24 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Issue Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>PPE Item</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Signature</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {register.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{employeeMap.get(entry.employeeId) || entry.employeeId}</TableCell>
                  <TableCell>{ppeItemMap.get(entry.ppeItemId) || entry.ppeItemId}</TableCell>
                  <TableCell>{format(new Date(entry.dateIssued), 'PPP')}</TableCell>
                  <TableCell>{format(new Date(entry.validUntil), 'PPP')}</TableCell>
                  <TableCell><Badge variant={new Date() > new Date(entry.validUntil) ? "destructive" : "default"}>{entry.signature}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end gap-2">
             <Button variant="secondary" onClick={handleSaveToGenerated}>
                <Save className="mr-2 h-4 w-4" /> Save to Generated Docs
            </Button>
            <Button onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
        </CardFooter>
      </Card>
    </>
  );
}
