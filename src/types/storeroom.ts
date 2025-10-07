import { Timestamp } from "firebase/firestore";

// Main categories
export type ItemCategory = "tool" | "consumable" | "ppe" | "equipment";

// Tool categories based on construction industry standards
export type ToolCategory =
  | "hand-tools"
  | "power-tools"
  | "measuring-tools"
  | "cutting-tools"
  | "drilling-tools"
  | "fastening-tools"
  | "grinding-tools"
  | "welding-equipment"
  | "concrete-tools"
  | "scaffolding-equipment"
  | "lifting-equipment"
  | "excavation-tools"
  | "painting-tools"
  | "plumbing-tools"
  | "electrical-tools"
  | "carpentry-tools"
  | "masonry-tools"
  | "demolition-tools"
  | "safety-testing-equipment"
  | "other";

// PPE categories
export type PPECategory =
  | "head-protection"
  | "eye-protection"
  | "hearing-protection"
  | "respiratory-protection"
  | "hand-protection"
  | "foot-protection"
  | "body-protection"
  | "fall-protection"
  | "high-visibility-clothing"
  | "other";

// Consumable categories
export type ConsumableCategory =
  | "fasteners"
  | "adhesives"
  | "sealants"
  | "lubricants"
  | "abrasives"
  | "welding-consumables"
  | "electrical-supplies"
  | "plumbing-supplies"
  | "painting-supplies"
  | "cleaning-supplies"
  | "first-aid-supplies"
  | "signage"
  | "tape-and-ties"
  | "concrete-materials"
  | "other";

export type ItemCondition = "excellent" | "good" | "fair" | "poor" | "needs-repair" | "decommissioned";

export type ItemStatus = "available" | "in-use" | "out-for-repair" | "reserved" | "decommissioned" | "disposed";

// Base interface for all storeroom items
export interface BaseStoreroomItem {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  companyId: string;
  companyName: string;
  location: string;
  status: ItemStatus;
  condition: ItemCondition;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastModifiedBy: string;

  // Tracking
  serialNumber?: string;
  assetTag?: string;
  purchaseDate?: Timestamp;
  purchasePrice?: number;
  supplier?: string;
  warrantyExpiry?: Timestamp;

  // Decommission info
  decommissionedAt?: Timestamp;
  decommissionedBy?: string;
  decommissionReason?: string;
  disposalMethod?: string;
}

// Tool specific
export interface Tool extends BaseStoreroomItem {
  category: "tool" | "equipment";
  toolCategory: ToolCategory;
  manufacturer?: string;
  model?: string;
  lastMaintenanceDate?: Timestamp;
  nextMaintenanceDate?: Timestamp;
  maintenanceInterval?: number; // days
  calibrationDate?: Timestamp;
  nextCalibrationDate?: Timestamp;
  assignedTo?: string; // user ID or department
  checkoutDate?: Timestamp;
  expectedReturnDate?: Timestamp;
}

// Consumable specific
export interface Consumable extends BaseStoreroomItem {
  category: "consumable";
  consumableCategory: ConsumableCategory;
  quantity: number;
  unit: string; // e.g., "boxes", "pieces", "meters", "liters"
  minimumStock: number;
  reorderPoint: number;
  maxStock?: number;
  expiryDate?: Timestamp;
  batchNumber?: string;
  storageRequirements?: string;
}

// PPE specific
export interface PPE extends BaseStoreroomItem {
  category: "ppe";
  ppeCategory: PPECategory;
  quantity: number;
  size?: string;
  minimumStock: number;
  reorderPoint: number;
  expiryDate?: Timestamp;
  certificationStandard?: string; // e.g., "EN 397", "ANSI Z87.1"
  certificationExpiry?: Timestamp;
  assignedTo?: string;
  issueDate?: Timestamp;
}

// Union type for all items
export type StoreroomItem = Tool | Consumable | PPE;

// For form handling
export type StoreroomItemInput = Omit<StoreroomItem, "id" | "createdAt" | "updatedAt">;

// Stock alert types
export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: "low-stock" | "out-of-stock" | "expiring-soon" | "expired" | "maintenance-due" | "calibration-due";
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
  companyId: string;
}

// Report types
export interface StoreroomReport {
  companyId: string;
  companyName: string;
  generatedAt: Timestamp;
  generatedBy: string;
  reportType: "inventory" | "low-stock" | "maintenance-due" | "decommissioned" | "all";
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  items: StoreroomItem[];
  summary: {
    totalItems: number;
    totalValue: number;
    itemsByCategory: Record<ItemCategory, number>;
    itemsByStatus: Record<ItemStatus, number>;
    lowStockItems: number;
    maintenanceDueItems: number;
    decommissionedItems: number;
  };
}

// Transaction log for audit trail
export interface StoreroomTransaction {
  id: string;
  itemId: string;
  itemName: string;
  companyId: string;
  transactionType: "added" | "updated" | "removed" | "checked-out" | "checked-in" | "decommissioned" | "disposed" | "transferred";
  performedBy: string;
  performedAt: Timestamp;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  notes?: string;
  quantity?: number; // for consumables/PPE
}
