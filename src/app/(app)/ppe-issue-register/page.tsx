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

const ppeRegister = [
  {
    employee: "John Doe",
    item: "Hard Hat",
    dateIssued: "2024-01-10",
    signature: "Signed",
  },
  {
    employee: "Jane Smith",
    item: "Safety Boots",
    dateIssued: "2024-02-15",
    signature: "Signed",
  },
  {
    employee: "Mike Johnson",
    item: "Reflective Vest",
    dateIssued: "2024-03-01",
    signature: "Signed",
  },
  {
    employee: "John Doe",
    item: "Safety Gloves",
    dateIssued: "2024-05-20",
    signature: "Signed",
  },
];

export default function PpeIssueRegisterPage() {
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
                <TableCell className="font-medium">{entry.employee}</TableCell>
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
