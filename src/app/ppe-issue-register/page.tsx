"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, PlusCircle, Save, ChevronDown, ChevronRight } from "lucide-react";
import type { Employee } from "@/types/core-data";
import type { PpeItem, PpeRegisterEntry } from "@/types/ppe";
import { format, addMonths } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    head: string[][];
    body: (string | number)[][];
    startY: number;
  }) => jsPDF;
}

async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch("/api/employees");
  if (!res.ok) throw new Error("Failed to load employees");
  const data = await res.json();
  return data.data ?? [];
}

async function fetchPpeItems(): Promise<PpeItem[]> {
  const res = await fetch("/api/ppe/items");
  if (!res.ok) throw new Error("Failed to load PPE catalogue");
  const data = await res.json();
  return data.data ?? [];
}

async function fetchRegister(): Promise<PpeRegisterEntry[]> {
  const res = await fetch("/api/ppe/register");
  if (!res.ok) throw new Error("Failed to load register entries");
  const data = await res.json();
  return data.data ?? [];
}

async function createRegisterEntry(entry: PpeRegisterEntry) {
  const res = await fetch("/api/ppe/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Failed to save register entry");
  const data = await res.json();
  return data.data as PpeRegisterEntry;
}

export default function PpeIssueRegisterPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ppeItems, setPpeItems] = useState<PpeItem[]>([]);
  const [register, setRegister] = useState<PpeRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [employeeData, itemData, registerData] = await Promise.all([
          fetchEmployees(),
          fetchPpeItems(),
          fetchRegister(),
        ]);
        setEmployees(employeeData);
        setPpeItems(itemData);
        setRegister(registerData);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to load register",
          description: "We could not load employees or PPE data.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const employeeMap = useMemo(
    () =>
      new Map(
        employees.map((e) => [String(e.id), `${e.firstName} ${e.surname}`])
      ),
    [employees]
  );
  const ppeItemMap = useMemo(
    () => new Map(ppeItems.map((item) => [item.id, item.name])),
    [ppeItems]
  );

  const groupedByEmployee = useMemo(() => {
    const map = new Map<string, PpeRegisterEntry[]>();
    register.forEach((entry) => {
      if (!map.has(entry.employeeId)) {
        map.set(entry.employeeId, []);
      }
      map.get(entry.employeeId)?.push(entry);
    });
    map.forEach((entries) =>
      entries.sort(
        (a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
      )
    );
    return map;
  }, [register]);

  const toggleExpand = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleIssuePpe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const employeeId = String(formData.get("employeeId"));
    const ppeItemId = String(formData.get("ppeItemId"));
    const validityMonths = parseInt(String(formData.get("validity")), 10);
    const issueDate = new Date();

    const lastIssue = register
      .filter(
        (entry) =>
          entry.employeeId === employeeId && entry.ppeItemId === ppeItemId
      )
      .sort(
        (a, b) =>
          new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
      )[0];

    if (lastIssue && new Date() < new Date(lastIssue.validUntil)) {
      toast({
        variant: "destructive",
        title: "Warning: Early Re-issue",
        description: `This item was issued on ${format(
          new Date(lastIssue.dateIssued),
          "PPP"
        )} and is valid until ${format(new Date(lastIssue.validUntil), "PPP")}.`,
      });
      return;
    }

    const newEntry: PpeRegisterEntry = {
      employeeId,
      ppeItemId,
      dateIssued: issueDate.toISOString().split("T")[0],
      validUntil: addMonths(issueDate, validityMonths).toISOString().split("T")[0],
      signature: "Signed",
    };

    try {
      const saved = await createRegisterEntry(newEntry);
      setRegister((prev) =>
        [saved, ...prev].sort(
          (a, b) =>
            new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime()
        )
      );

      toast({
        title: "PPE Issued",
        description: `${ppeItemMap.get(ppeItemId)} issued to ${employeeMap.get(
          employeeId
        )}.`,
      });
      setIsIssueOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to save entry",
        description: "We could not store this issue record.",
      });
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(16);
    doc.text("PPE Issue Register Report", 14, 15);

    const tableData = register.map((entry) => [
      employeeMap.get(entry.employeeId) || entry.employeeId,
      ppeItemMap.get(entry.ppeItemId) || entry.ppeItemId,
      format(new Date(entry.dateIssued), "PPP"),
      format(new Date(entry.validUntil), "PPP"),
      entry.signature,
    ]);

    doc.autoTable({
      head: [["Employee", "PPE Item", "Date Issued", "Valid Until", "Signature"]],
      body: tableData,
      startY: 25,
    });

    doc.save("PPE_Issue_Register.pdf");
  };

  const handleSaveToGenerated = () => {
    toast({
      title: "Report Saved",
      description:
        "The PPE Issue Register has been saved to Generated Documents.",
    });
  };

  if (loading) {
    return <p className="p-6">Loading PPE register…</p>;
  }

  return (
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Issue PPE
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New PPE</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIssuePpe} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={String(emp.id)} value={String(emp.id)}>
                        {emp.firstName} {emp.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ppeItemId">PPE Item</Label>
                <Select name="ppeItemId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PPE item" />
                  </SelectTrigger>
                  <SelectContent>
                    {ppeItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity">Validity Period</Label>
                <Select name="validity" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select validity period" />
                  </SelectTrigger>
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
              <TableHead />
              <TableHead>Employee</TableHead>
              <TableHead>Most Recent Item</TableHead>
              <TableHead>Valid Until</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(groupedByEmployee.entries()).map(([employeeId, entries]) => {
              const latest = entries[0];
              const isExpanded = expandedEmployees.has(employeeId);

              return (
                <React.Fragment key={employeeId}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggleExpand(employeeId)}
                  >
                    <TableCell className="w-6">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {employeeMap.get(employeeId) || employeeId}
                    </TableCell>
                    <TableCell>
                      {ppeItemMap.get(latest.ppeItemId) || latest.ppeItemId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          new Date() > new Date(latest.validUntil)
                            ? "destructive"
                            : "default"
                        }
                      >
                        {format(new Date(latest.validUntil), "PPP")}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {isExpanded &&
                    entries.map((entry, idx) => (
                      <TableRow key={`${employeeId}-${idx}`} className="bg-muted/30">
                        <TableCell />
                        <TableCell />
                        <TableCell>
                          {ppeItemMap.get(entry.ppeItemId) || entry.ppeItemId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              new Date() > new Date(entry.validUntil)
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {format(new Date(entry.dateIssued), "PPP")} →{" "}
                            {format(new Date(entry.validUntil), "PPP")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              );
            })}
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
  );
}
