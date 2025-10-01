"use client";

import { useState, useMemo } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Search, Edit } from "lucide-react";
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
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const handleAddItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const category = formData.get("category") as ItemCategory;
    if (!category) return;

    const newItem: StockItem = {
      id: crypto.randomUUID?.() ?? `${category}-${Date.now()}`,
      name: (formData.get("name") as string) || "Unnamed",
      category,
      prefix: (formData.get("prefix") as string) || undefined,
      quantity: parseInt((formData.get("quantity") as string) || "1", 10),
      location: (formData.get("location") as string) || "Unassigned",
      expiryDate: (formData.get("expiryDate") as string) || undefined,
      condition: (formData.get("condition") as ItemCondition) || undefined,
      status: (formData.get("status") as ItemStatus) || "In Storeroom",
    };

    setStock([...stock, newItem]);
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to the storeroom.`,
    });
    setIsAddOpen(false);
  };

  const handleEditItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(event.currentTarget);

    setStock(
      stock.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: (formData.get("name") as string) || item.name,
              category: (formData.get("category") as ItemCategory) || item.category,
              prefix: (formData.get("prefix") as string) || undefined,
              quantity: parseInt((formData.get("quantity") as string) || "1", 10),
              location: (formData.get("location") as string) || item.location,
              expiryDate: (formData.get("expiryDate") as string) || undefined,
              condition: (formData.get("condition") as ItemCondition) || undefined,
              status: (formData.get("status") as ItemStatus) || "In Storeroom",
            }
          : item
      )
    );
    toast({ title: "Item Updated" });
    setEditingItem(null);
  };

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

  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.prefix && item.prefix.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter ||
        item.condition === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stock, searchTerm, statusFilter]);

  const renderTable = (items: StockItem[], category: ItemCategory) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          {category === "Tool" || category === "Equipment" ? (
            <TableHead>Prefix/Code</TableHead>
          ) : (
            <TableHead>Quantity</TableHead>
          )}
          <TableHead>Location</TableHead>
          <TableHead>Status / Condition</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              {category === "Tool" || category === "Equipment"
                ? item.prefix || "N/A"
                : item.quantity}
            </TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>
              {item.status && (
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status}
                </Badge>
              )}
              {item.condition && (
                <Badge
                  className="ml-1"
                  variant={getStatusBadgeVariant(item.condition)}
                >
                  {item.condition}
                </Badge>
              )}
            </TableCell>
            <TableCell>{item.expiryDate || "N/A"}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingItem(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <ItemForm onSubmit={handleAddItem} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by item name or prefix..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Filter by status/condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses/Conditions</SelectItem>
              <SelectItem value="In Storeroom">In Storeroom</SelectItem>
              <SelectItem value="In Use">In Use</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Needs Repair">Needs Repair</SelectItem>
              <SelectItem value="Out for Repair">Out for Repair</SelectItem>
              <SelectItem value="Awaiting Discard">Awaiting Discard</SelectItem>
              <SelectItem value="Discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            {renderTable(filteredStock.filter((i) => i.category === "PPE"), "PPE")}
          </TabsContent>
          <TabsContent value="Consumable">
            {renderTable(filteredStock.filter((i) => i.category === "Consumable"), "Consumable")}
          </TabsContent>
          <TabsContent value="Tool">
            {renderTable(filteredStock.filter((i) => i.category === "Tool"), "Tool")}
          </TabsContent>
          <TabsContent value="Equipment">
            {renderTable(filteredStock.filter((i) => i.category === "Equipment"), "Equipment")}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit: {editingItem?.name}</DialogTitle>
            </DialogHeader>
            <ItemForm onSubmit={handleEditItem} defaultValues={editingItem} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function ItemForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  defaultValues?: StockItem | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={defaultValues?.category}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
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
        <Input
          id="name"
          name="name"
          placeholder="e.g., Safety Helmet"
          required
          defaultValue={defaultValues?.name}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prefix">Prefix / Code (for Tools/Equipment)</Label>
        <Input
          id="prefix"
          name="prefix"
          placeholder="e.g., RAK-T-015"
          defaultValue={defaultValues?.prefix}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          required
          defaultValue={defaultValues?.quantity}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g., Shelf A1"
          required
          defaultValue={defaultValues?.location}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
        <Input
          id="expiryDate"
          name="expiryDate"
          type="date"
          defaultValue={defaultValues?.expiryDate}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="condition">Condition (for Tools/Equipment)</Label>
        <Select name="condition" defaultValue={defaultValues?.condition}>
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
            <SelectItem value="Awaiting Discard">Awaiting Discard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={defaultValues?.status}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="In Storeroom">In Storeroom</SelectItem>
            <SelectItem value="In Use">In Use</SelectItem>
            <SelectItem value="Out for Repair">Out for Repair</SelectItem>
            <SelectItem value="Discarded">Discarded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}
