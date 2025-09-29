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
import { Badge } from "@/components/ui/badge";

const stock = [
  {
    item: "Hard Hat",
    category: "PPE",
    quantity: 50,
    location: "Shelf A1",
  },
  {
    item: "Safety Gloves",
    category: "PPE",
    quantity: 120,
    location: "Shelf A2",
  },
  {
    item: "Drill Bits (Box)",
    category: "Consumable",
    quantity: 30,
    location: "Bin C5",
  },
  {
    item: "Cutting Discs (115mm)",
    category: "Consumable",
    quantity: 200,
    location: "Bin C6",
  },
  {
    item: "Safety Goggles",
    category: "PPE",
    quantity: 75,
    location: "Shelf A1",
  },
];

export default function StoreroomTrackerPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storeroom & Stocktake Tracker</CardTitle>
        <CardDescription>
          Manage storeroom inventory, including PPE and consumables.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.map((item) => (
              <TableRow key={item.item}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell>
                  <Badge variant={item.category === 'PPE' ? 'secondary' : 'outline'}>
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
