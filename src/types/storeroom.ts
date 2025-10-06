export type ItemCategory = "PPE" | "Consumable" | "Tool" | "Equipment";
export type ItemCondition = "Good" | "Needs Repair" | "Awaiting Discard";
export type ItemStatus = "In Use" | "In Storeroom" | "Out for Repair" | "Discarded";

export type StockItem = {
  id: string;
  name: string;
  category: ItemCategory;
  prefix?: string;
  quantity: number;
  location: string;
  expiryDate?: string;
  condition?: ItemCondition;
  status?: ItemStatus;
  createdAt?: string;
  updatedAt?: string;
};
