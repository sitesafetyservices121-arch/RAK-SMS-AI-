"use client";

import { useState } from "react";
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
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ItemCategory = "PPE" | "Consumable" | "Tool" | "Equipment";
type ItemCondition = "Good" | "Needs Repair" | "Awaiting Discard";
type ItemStatus = "In Use" | "In Storeroom" | "Out for Repair" | "Discarded";

type StockItem = {
  id: string;
  name: string;
  category: ItemCategory;
  prefix?: string;
  quantity: number;
  location: string;
  expiryDate?: string;
  condition?: ItemCondition;
  status?: ItemStatus;
};

const initialStock: StockItem[] = [
  { id: "ppe-001", name: "Hard Hat", category: "PPE", quantity: 50, location: "Shelf A1", expiryDate: "2026-01-01", status: "In Storeroom" },
  { id: "ppe-002", name: "Safety Gloves", category: "PPE", quantity: 120, location: "Shelf A2", status: "In Storeroom" },
  { id: "ppe-003", name: "Safety Goggles", category: "PPE", quantity: 75, location: "Shelf A1", status: "In Storeroom" },
  { id: "con-001", name: "Drill Bits (Box)", category: "Consumable", quantity: 30, location: "Bin C5", status: "In Storeroom" },
  { id: "con-002", name: "Cutting Discs (115mm)", category: "Consumable", quantity: 200, location: "Bin C6", status: "In Storeroom" },
  { id: "tool-001", name: "Cordless Drill", prefix: "RAK-T-015", category: "Tool", quantity: 1, location: "Tool Cage", condition: "Good", status: "In Use" },
  { id: "tool-002", name: "Angle Grinder", prefix: "RAK-T-016", category: "Tool", quantity: 1, location: "Repair Bay", condition: "Needs Repair", status: "Out for Repair" },
  { id: "equip-001", name: "Generator 5kW", prefix: "RAK-E-003", category: "Equipment", quantity: 1, location: "Site B", status: "In Use", expiryDate: "2025-05-20" },
];

export default function StoreroomTrackerPage() {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const handleAddItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get("category") as ItemCategory;
    
    const newItem: StockItem = {
      id: `${category.toLowerCase().slice(0,4)}-${Math.random().toString(36).substr(2, 5)}`,
      name: formData.get("name") as string,
      category,
      prefix: formData.get("prefix") as string || undefined,
      quantity: parseInt(formData.get("quantity") as string || "1"),
      location: formData.get("location") as string,
      expiryDate: formData.get("expiryDate") as string || undefined,
      condition: formData.get("condition") as ItemCondition || undefined,
      status: formData.get("status") as ItemStatus || "In Storeroom",
    };

    setStock([...stock, newItem]);
    toast({
        title: "Item Added",
        description: `${newItem.name} has been added to the storeroom.`
    });
    setIsAddOpen(false);
  }

  const getStatusBadgeVariant = (status?: ItemStatus | ItemCondition) => {
    switch (status) {
      case "In Use":
      case "Good":
        return "default";
      case "Needs Repair":
      case "Out for Repair":
        return "secondary";
      case "Discarded":
      case "Awaiting Discard":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderTable = (items: StockItem[], category: ItemCategory) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          {category === 'Tool' || category === 'Equipment' ? <TableHead>Prefix/Code</TableHead> : <TableHead>Quantity</TableHead>}
          <TableHead>Location</TableHead>
          <TableHead>Status / Condition</TableHead>
          <TableHead>Expiry Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{category === 'Tool' || category === 'Equipment' ? item.prefix || 'N/A' : item.quantity}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>
              {item.status && <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>}
              {item.condition && <Badge className="ml-1" variant={getStatusBadgeVariant(item.condition)}>{item.condition}</Badge>}
            </TableCell>
            <TableCell>{item.expiryDate || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Storeroom & Stocktake Tracker</CardTitle>
          <CardDescription>
            Manage storeroom inventory, including PPE, consumables, tools, and equipment.
          </CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Storeroom Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                            <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PPE">PPE</SelectItem>
                                <SelectItem value="Consumable">Consumable</SelectItem>
                                <SelectItem value="Tool">Tool</SelectItem>
                                <SelectItem value="Equipment">Equipment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Safety Helmet" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prefix">Prefix / Code (for Tools/Equipment)</Label>
                        <Input id="prefix" name="prefix" placeholder="e.g., RAK-T-015" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" type="number" defaultValue="1" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="e.g., Shelf A1" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                        <Input id="expiryDate" name="expiryDate" type="date" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="condition">Condition (for Tools/Equipment)</Label>
                        <Select name="condition">
                            <SelectTrigger id="condition"><SelectValue placeholder="Select condition" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                                <SelectItem value="Awaiting Discard">Awaiting Discard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                         <Select name="status" defaultValue="In Storeroom">
                            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="In Storeroom">In Storeroom</SelectItem>
                                <SelectItem value="In Use">In Use</SelectItem>
                                <SelectItem value="Out for Repair">Out for Repair</SelectItem>
                                <SelectItem value="Discarded">Discarded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="PPE">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="PPE">PPE</TabsTrigger>
            <TabsTrigger value="Consumable">Consumables</TabsTrigger>
            <TabsTrigger value="Tool">Tools</TabsTrigger>
            <TabsTrigger value="Equipment">Equipment</TabsTrigger>
          </TabsList>
          <TabsContent value="PPE">
            {renderTable(stock.filter(item => item.category === 'PPE'), "PPE")}
          </TabsContent>
          <TabsContent value="Consumable">
            {renderTable(stock.filter(item => item.category === 'Consumable'), "Consumable")}
          </TabsContent>
          <TabsContent value="Tool">
             {renderTable(stock.filter(item => item.category === 'Tool'), "Tool")}
          </TabsContent>
           <TabsContent value="Equipment">
             {renderTable(stock.filter(item => item.category === 'Equipment'), "Equipment")}
           </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
