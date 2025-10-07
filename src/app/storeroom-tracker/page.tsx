"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase-client";
import { doc, getDoc } from "firebase/firestore";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Download,
  Filter,
  Package,
  Wrench,
  ShieldCheck,
  BoxIcon,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  StoreroomItem,
  Tool,
  Consumable,
  PPE,
  ItemCategory,
  ItemStatus,
  ItemCondition,
  ToolCategory,
  PPECategory,
  ConsumableCategory,
} from "@/types/storeroom";

// Helper constants
const TOOL_CATEGORIES: Record<ToolCategory, string> = {
  "hand-tools": "Hand Tools",
  "power-tools": "Power Tools",
  "measuring-tools": "Measuring Tools",
  "cutting-tools": "Cutting Tools",
  "drilling-tools": "Drilling Tools",
  "fastening-tools": "Fastening Tools",
  "grinding-tools": "Grinding Tools",
  "welding-equipment": "Welding Equipment",
  "concrete-tools": "Concrete Tools",
  "scaffolding-equipment": "Scaffolding Equipment",
  "lifting-equipment": "Lifting Equipment",
  "excavation-tools": "Excavation Tools",
  "painting-tools": "Painting Tools",
  "plumbing-tools": "Plumbing Tools",
  "electrical-tools": "Electrical Tools",
  "carpentry-tools": "Carpentry Tools",
  "masonry-tools": "Masonry Tools",
  "demolition-tools": "Demolition Tools",
  "safety-testing-equipment": "Safety Testing Equipment",
  other: "Other",
};

const PPE_CATEGORIES: Record<PPECategory, string> = {
  "head-protection": "Head Protection",
  "eye-protection": "Eye Protection",
  "hearing-protection": "Hearing Protection",
  "respiratory-protection": "Respiratory Protection",
  "hand-protection": "Hand Protection",
  "foot-protection": "Foot Protection",
  "body-protection": "Body Protection",
  "fall-protection": "Fall Protection",
  "high-visibility-clothing": "High Visibility Clothing",
  other: "Other",
};

const CONSUMABLE_CATEGORIES: Record<ConsumableCategory, string> = {
  fasteners: "Fasteners",
  adhesives: "Adhesives",
  sealants: "Sealants",
  lubricants: "Lubricants",
  abrasives: "Abrasives",
  "welding-consumables": "Welding Consumables",
  "electrical-supplies": "Electrical Supplies",
  "plumbing-supplies": "Plumbing Supplies",
  "painting-supplies": "Painting Supplies",
  "cleaning-supplies": "Cleaning Supplies",
  "first-aid-supplies": "First Aid Supplies",
  signage: "Signage",
  "tape-and-ties": "Tape & Ties",
  "concrete-materials": "Concrete Materials",
  other: "Other",
};

export default function StoreroomTrackerPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<StoreroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreroomItem | null>(null);
  const [decommissionItem, setDecommissionItem] = useState<StoreroomItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyId, setCompanyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const { toast } = useToast();

  // Fetch user's company
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (!user?.uid) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCompanyId(userData.companyId || "");
          setCompanyName(userData.companyName || "Unknown Company");
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
      }
    };

    fetchUserCompany();
  }, [user]);

  // Fetch storeroom items
  useEffect(() => {
    const fetchItems = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`/api/storeroom?companyId=${companyId}`);
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast({
          title: "Error",
          description: "Failed to load storeroom items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [companyId, toast]);

  const handleAddItem = async (newItem: Partial<StoreroomItem>) => {
    try {
      const itemWithMetadata = {
        ...newItem,
        companyId,
        companyName,
        createdBy: user?.uid || "unknown",
        lastModifiedBy: user?.uid || "unknown",
      };

      const response = await fetch("/api/storeroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemWithMetadata),
      });

      if (!response.ok) throw new Error("Failed to add item");

      const savedItem = await response.json();
      setItems([...items, savedItem]);
      setIsAddOpen(false);

      toast({
        title: "Item Added",
        description: `${savedItem.name} has been added to storeroom`,
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async (updatedItem: StoreroomItem) => {
    try {
      const itemWithMetadata = {
        ...updatedItem,
        lastModifiedBy: user?.uid || "unknown",
      };

      const response = await fetch(`/api/storeroom/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemWithMetadata),
      });

      if (!response.ok) throw new Error("Failed to update item");

      const updated = await response.json();
      setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      setEditingItem(null);

      toast({
        title: "Item Updated",
        description: `${updated.name} has been updated`,
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDecommission = async (itemId: string, reason: string, disposalMethod: string) => {
    try {
      const response = await fetch(`/api/storeroom/${itemId}/decommission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performedBy: user?.uid || "unknown",
          reason,
          disposalMethod,
        }),
      });

      if (!response.ok) throw new Error("Failed to decommission item");

      const decommissioned = await response.json();
      setItems(items.map((i) => (i.id === decommissioned.id ? decommissioned : i)));
      setDecommissionItem(null);

      toast({
        title: "Item Decommissioned",
        description: `${decommissioned.name} has been decommissioned`,
      });
    } catch (error) {
      console.error("Error decommissioning item:", error);
      toast({
        title: "Error",
        description: "Failed to decommission item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/storeroom/${itemId}?performedBy=${user?.uid}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");

      setItems(items.filter((i) => i.id !== itemId));

      toast({
        title: "Item Deleted",
        description: "Item has been removed from storeroom",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(
        `/api/storeroom/report?companyId=${companyId}&reportType=all&userId=${user?.uid}`
      );

      if (!response.ok) throw new Error("Failed to generate report");

      const report = await response.json();

      // Create downloadable report
      const reportText = `
STOREROOM INVENTORY REPORT
Company: ${report.companyName}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Generated By: ${user?.displayName || user?.email}

SUMMARY
-------
Total Items: ${report.summary.totalItems}
Total Value: R ${report.summary.totalValue.toFixed(2)}
Low Stock Items: ${report.summary.lowStockItems}
Maintenance Due: ${report.summary.maintenanceDueItems}
Decommissioned: ${report.summary.decommissionedItems}

ITEMS BY CATEGORY
-----------------
Tools: ${report.summary.itemsByCategory.tool || 0}
Consumables: ${report.summary.itemsByCategory.consumable || 0}
PPE: ${report.summary.itemsByCategory.ppe || 0}
Equipment: ${report.summary.itemsByCategory.equipment || 0}

ITEMS BY STATUS
---------------
Available: ${report.summary.itemsByStatus.available || 0}
In Use: ${report.summary.itemsByStatus["in-use"] || 0}
Out for Repair: ${report.summary.itemsByStatus["out-for-repair"] || 0}
Decommissioned: ${report.summary.itemsByStatus.decommissioned || 0}

DETAILED INVENTORY
------------------
${report.items
  .map(
    (item: StoreroomItem) => `
Item: ${item.name}
Category: ${item.category}
Status: ${item.status}
Condition: ${item.condition}
Location: ${item.location}
${item.category === "consumable" || item.category === "ppe" ? `Quantity: ${"quantity" in item ? item.quantity : "N/A"}` : ""}
${item.serialNumber ? `Serial Number: ${item.serialNumber}` : ""}
---`
  )
  .join("\n")}
      `.trim();

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storeroom-report-${companyName}-${new Date().toISOString().split("T")[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: ItemStatus) => {
    switch (status) {
      case "available":
        return "default";
      case "in-use":
        return "secondary";
      case "out-for-repair":
        return "outline";
      case "decommissioned":
      case "disposed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getConditionBadgeVariant = (condition: ItemCondition) => {
    switch (condition) {
      case "excellent":
      case "good":
        return "default";
      case "fair":
        return "secondary";
      case "poor":
      case "needs-repair":
        return "outline";
      case "decommissioned":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetTag?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Calculate alerts
  const alerts = useMemo(() => {
    const alertsList: Array<{ type: string; message: string; severity: "info" | "warning" | "critical" }> = [];

    items.forEach((item) => {
      // Low stock alerts
      if ((item.category === "consumable" || item.category === "ppe") && "quantity" in item) {
        if (item.quantity === 0) {
          alertsList.push({
            type: "out-of-stock",
            message: `${item.name} is out of stock`,
            severity: "critical",
          });
        } else if (item.quantity <= item.reorderPoint) {
          alertsList.push({
            type: "low-stock",
            message: `${item.name} is low on stock (${item.quantity} ${"unit" in item ? item.unit : "units"})`,
            severity: "warning",
          });
        }
      }

      // Maintenance due alerts
      if (item.category === "tool" && "nextMaintenanceDate" in item && item.nextMaintenanceDate) {
        const now = new Date();
        const nextMaintenance = item.nextMaintenanceDate.toDate();
        if (nextMaintenance <= now) {
          alertsList.push({
            type: "maintenance-due",
            message: `${item.name} maintenance is overdue`,
            severity: "warning",
          });
        }
      }

      // Expiry alerts
      if ("expiryDate" in item && item.expiryDate) {
        const now = new Date();
        const expiryDate = item.expiryDate.toDate();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
          alertsList.push({
            type: "expired",
            message: `${item.name} has expired`,
            severity: "critical",
          });
        } else if (daysUntilExpiry <= 30) {
          alertsList.push({
            type: "expiring-soon",
            message: `${item.name} expires in ${daysUntilExpiry} days`,
            severity: "warning",
          });
        }
      }
    });

    return alertsList;
  }, [items]);

  const renderItemsTable = (categoryItems: StoreroomItem[], category: ItemCategory) => {
    const categoryIcon =
      category === "tool" || category === "equipment" ? (
        <Wrench className="h-4 w-4" />
      ) : category === "ppe" ? (
        <ShieldCheck className="h-4 w-4" />
      ) : (
        <Package className="h-4 w-4" />
      );

    return (
      <div className="space-y-4">
        {categoryItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BoxIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No items in this category</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                {category === "tool" || category === "equipment" ? (
                  <>
                    <TableHead>Serial/Asset</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                  </>
                )}
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {categoryIcon}
                      <span className="text-xs">
                        {category === "tool" || category === "equipment"
                          ? TOOL_CATEGORIES[(item as Tool).toolCategory]
                          : category === "ppe"
                            ? PPE_CATEGORIES[(item as PPE).ppeCategory]
                            : CONSUMABLE_CATEGORIES[(item as Consumable).consumableCategory]}
                      </span>
                    </div>
                  </TableCell>
                  {category === "tool" || category === "equipment" ? (
                    <>
                      <TableCell className="text-xs">
                        {item.serialNumber || item.assetTag || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {"assignedTo" in item ? item.assignedTo || "Unassigned" : "N/A"}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        {"quantity" in item ? (
                          <span
                            className={
                              item.quantity <= item.reorderPoint ? "text-red-600 font-bold" : ""
                            }
                          >
                            {item.quantity}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {"unit" in item ? item.unit : "N/A"}
                      </TableCell>
                    </>
                  )}
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getConditionBadgeVariant(item.condition)}>{item.condition}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {item.status !== "decommissioned" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDecommissionItem(item)}
                        >
                          <XCircle className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Storeroom...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle>Storeroom Alerts ({alerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    alert.severity === "critical"
                      ? "bg-red-50 text-red-800"
                      : alert.severity === "warning"
                        ? "bg-orange-50 text-orange-800"
                        : "bg-blue-50 text-blue-800"
                  }`}
                >
                  {alert.message}
                </div>
              ))}
              {alerts.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  + {alerts.length - 5} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Storeroom Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Storeroom Tracker</CardTitle>
              <CardDescription>
                Manage tools, equipment, consumables, and PPE for {companyName}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateReport} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Generate Report
              </Button>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <ItemForm onSubmit={handleAddItem} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, serial number, or asset tag..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="out-for-repair">Out for Repair</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
              <TabsTrigger value="tool">
                Tools ({filteredItems.filter((i) => i.category === "tool" || i.category === "equipment").length})
              </TabsTrigger>
              <TabsTrigger value="consumable">
                Consumables ({filteredItems.filter((i) => i.category === "consumable").length})
              </TabsTrigger>
              <TabsTrigger value="ppe">
                PPE ({filteredItems.filter((i) => i.category === "ppe").length})
              </TabsTrigger>
              <TabsTrigger value="decommissioned">
                Decommissioned ({filteredItems.filter((i) => i.status === "decommissioned").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">{renderItemsTable(filteredItems, "tool")}</TabsContent>
            <TabsContent value="tool">
              {renderItemsTable(
                filteredItems.filter((i) => i.category === "tool" || i.category === "equipment"),
                "tool"
              )}
            </TabsContent>
            <TabsContent value="consumable">
              {renderItemsTable(
                filteredItems.filter((i) => i.category === "consumable"),
                "consumable"
              )}
            </TabsContent>
            <TabsContent value="ppe">
              {renderItemsTable(filteredItems.filter((i) => i.category === "ppe"), "ppe")}
            </TabsContent>
            <TabsContent value="decommissioned">
              {renderItemsTable(
                filteredItems.filter((i) => i.status === "decommissioned"),
                "tool"
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit: {editingItem?.name}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ItemForm defaultValues={editingItem} onSubmit={handleUpdateItem} />
          )}
        </DialogContent>
      </Dialog>

      {/* Decommission Dialog */}
      <Dialog
        open={!!decommissionItem}
        onOpenChange={(open) => !open && setDecommissionItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decommission Item</DialogTitle>
            <DialogDescription>
              Mark {decommissionItem?.name} as decommissioned. This action can be tracked but not easily reversed.
            </DialogDescription>
          </DialogHeader>
          <DecommissionForm
            onSubmit={(reason, disposalMethod) => {
              if (decommissionItem) {
                handleDecommission(decommissionItem.id, reason, disposalMethod);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Form Components
function ItemForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: StoreroomItem;
  onSubmit: (item: any) => void;
}) {
  const [category, setCategory] = useState<ItemCategory>(defaultValues?.category || "tool");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const baseItem = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category,
      location: formData.get("location") as string,
      status: formData.get("status") as ItemStatus,
      condition: formData.get("condition") as ItemCondition,
      notes: formData.get("notes") as string,
      serialNumber: formData.get("serialNumber") as string,
      assetTag: formData.get("assetTag") as string,
      supplier: formData.get("supplier") as string,
      purchasePrice: parseFloat(formData.get("purchasePrice") as string) || undefined,
    };

    let specificFields = {};

    if (category === "tool" || category === "equipment") {
      specificFields = {
        toolCategory: formData.get("toolCategory") as ToolCategory,
        manufacturer: formData.get("manufacturer") as string,
        model: formData.get("model") as string,
        assignedTo: formData.get("assignedTo") as string,
        maintenanceInterval: parseInt(formData.get("maintenanceInterval") as string) || undefined,
      };
    } else if (category === "consumable") {
      specificFields = {
        consumableCategory: formData.get("consumableCategory") as ConsumableCategory,
        quantity: parseInt(formData.get("quantity") as string),
        unit: formData.get("unit") as string,
        minimumStock: parseInt(formData.get("minimumStock") as string),
        reorderPoint: parseInt(formData.get("reorderPoint") as string),
        batchNumber: formData.get("batchNumber") as string,
      };
    } else if (category === "ppe") {
      specificFields = {
        ppeCategory: formData.get("ppeCategory") as PPECategory,
        quantity: parseInt(formData.get("quantity") as string),
        size: formData.get("size") as string,
        minimumStock: parseInt(formData.get("minimumStock") as string),
        reorderPoint: parseInt(formData.get("reorderPoint") as string),
        certificationStandard: formData.get("certificationStandard") as string,
      };
    }

    onSubmit({
      ...baseItem,
      ...specificFields,
      ...(defaultValues ? { id: defaultValues.id } : {}),
    } as Partial<StoreroomItem>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ItemCategory)}
          disabled={!!defaultValues}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tool">Tool</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="consumable">Consumable</SelectItem>
            <SelectItem value="ppe">PPE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      {(category === "tool" || category === "equipment") && (
        <div className="space-y-2">
          <Label htmlFor="toolCategory">Tool Category *</Label>
          <Select
            name="toolCategory"
            defaultValue={defaultValues && "toolCategory" in defaultValues ? defaultValues.toolCategory : undefined}
          >
            <SelectTrigger id="toolCategory">
              <SelectValue placeholder="Select tool category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TOOL_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {category === "consumable" && (
        <div className="space-y-2">
          <Label htmlFor="consumableCategory">Consumable Category *</Label>
          <Select
            name="consumableCategory"
            defaultValue={
              defaultValues && "consumableCategory" in defaultValues
                ? defaultValues.consumableCategory
                : undefined
            }
          >
            <SelectTrigger id="consumableCategory">
              <SelectValue placeholder="Select consumable category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONSUMABLE_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {category === "ppe" && (
        <div className="space-y-2">
          <Label htmlFor="ppeCategory">PPE Category *</Label>
          <Select
            name="ppeCategory"
            defaultValue={
              defaultValues && "ppeCategory" in defaultValues ? defaultValues.ppeCategory : undefined
            }
          >
            <SelectTrigger id="ppeCategory">
              <SelectValue placeholder="Select PPE category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PPE_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input id="location" name="location" required defaultValue={defaultValues?.location} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={defaultValues?.status || "available"}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="out-for-repair">Out for Repair</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition *</Label>
          <Select name="condition" defaultValue={defaultValues?.condition || "good"}>
            <SelectTrigger id="condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="needs-repair">Needs Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            defaultValue={defaultValues?.serialNumber}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assetTag">Asset Tag</Label>
          <Input id="assetTag" name="assetTag" defaultValue={defaultValues?.assetTag} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" name="supplier" defaultValue={defaultValues?.supplier} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase Price (R)</Label>
          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            defaultValue={defaultValues?.purchasePrice}
          />
        </div>
      </div>

      {/* Category-specific fields */}
      {(category === "tool" || category === "equipment") && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              defaultValue={
                defaultValues && "manufacturer" in defaultValues ? defaultValues.manufacturer : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              defaultValue={defaultValues && "model" in defaultValues ? defaultValues.model : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              name="assignedTo"
              defaultValue={
                defaultValues && "assignedTo" in defaultValues ? defaultValues.assignedTo : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceInterval">Maintenance Interval (days)</Label>
            <Input
              id="maintenanceInterval"
              name="maintenanceInterval"
              type="number"
              defaultValue={
                defaultValues && "maintenanceInterval" in defaultValues
                  ? defaultValues.maintenanceInterval
                  : ""
              }
            />
          </div>
        </div>
      )}

      {(category === "consumable" || category === "ppe") && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              required
              defaultValue={defaultValues && "quantity" in defaultValues ? defaultValues.quantity : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              name="unit"
              required
              placeholder="e.g., pieces, boxes, meters"
              defaultValue={defaultValues && "unit" in defaultValues ? defaultValues.unit : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumStock">Minimum Stock *</Label>
            <Input
              id="minimumStock"
              name="minimumStock"
              type="number"
              required
              defaultValue={
                defaultValues && "minimumStock" in defaultValues ? defaultValues.minimumStock : ""
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder Point *</Label>
            <Input
              id="reorderPoint"
              name="reorderPoint"
              type="number"
              required
              defaultValue={
                defaultValues && "reorderPoint" in defaultValues ? defaultValues.reorderPoint : ""
              }
            />
          </div>

          {category === "consumable" && (
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                name="batchNumber"
                defaultValue={
                  defaultValues && "batchNumber" in defaultValues ? defaultValues.batchNumber : ""
                }
              />
            </div>
          )}

          {category === "ppe" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  name="size"
                  defaultValue={defaultValues && "size" in defaultValues ? defaultValues.size : ""}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="certificationStandard">Certification Standard</Label>
                <Input
                  id="certificationStandard"
                  name="certificationStandard"
                  placeholder="e.g., EN 397, ANSI Z87.1"
                  defaultValue={
                    defaultValues && "certificationStandard" in defaultValues
                      ? defaultValues.certificationStandard
                      : ""
                  }
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={defaultValues?.notes} />
      </div>

      <DialogFooter>
        <Button type="submit">{defaultValues ? "Update" : "Add"} Item</Button>
      </DialogFooter>
    </form>
  );
}

function DecommissionForm({
  onSubmit,
}: {
  onSubmit: (reason: string, disposalMethod: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason, disposalMethod);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Decommission *</Label>
        <Textarea
          id="reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., End of life, Damaged beyond repair, No longer needed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disposalMethod">Disposal Method</Label>
        <Select value={disposalMethod} onValueChange={setDisposalMethod}>
          <SelectTrigger id="disposalMethod">
            <SelectValue placeholder="Select disposal method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recycled">Recycled</SelectItem>
            <SelectItem value="disposed">Disposed</SelectItem>
            <SelectItem value="donated">Donated</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="returned-to-supplier">Returned to Supplier</SelectItem>
            <SelectItem value="pending">Pending Decision</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" variant="destructive">
          Decommission Item
        </Button>
      </DialogFooter>
    </form>
  );
}
