
"use client";

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
import { initialEmployees, ppeRegister } from "@/lib/employee-data";

export default function PpeIssueRegisterPage() {
  const employeeMap = new Map(initialEmployees.map(e => [e.id, `${e.firstName} ${e.surname}`]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>PPE Issue Register</CardTitle>
        <CardDescription>
          Track the issuance of Personal Protective Equipment to employees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>PPE Item</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Signature Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ppeRegister.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{employeeMap.get(entry.employeeId) || entry.employeeId}</TableCell>
                <TableCell>{entry.item}</TableCell>
                <TableCell>{entry.dateIssued}</TableCell>
                <TableCell>{entry.signature}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
