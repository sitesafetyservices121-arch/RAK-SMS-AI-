// ==============================
// Site Resource Data
// ==============================
export type ResourceCategory = "Material" | "Equipment" | "Tool" | "Other";

export type SiteResource = {
  id: string;
  siteId: string;          // Link to Site
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;            // e.g. "bags", "tons", "units"
  status: "Available" | "In Use" | "Maintenance" | "Depleted";
};

export const initialResources: SiteResource[] = [
  {
    id: "res-001",
    siteId: "site-01",
    name: "Cement Bags",
    category: "Material",
    quantity: 200,
    unit: "bags",
    status: "Available",
  },
  {
    id: "res-002",
    siteId: "site-01",
    name: "Excavator",
    category: "Equipment",
    quantity: 1,
    unit: "unit",
    status: "In Use",
  },
  {
    id: "res-003",
    siteId: "site-02",
    name: "Steel Beams",
    category: "Material",
    quantity: 120,
    unit: "tons",
    status: "Available",
  },
  {
    id: "res-004",
    siteId: "site-03",
    name: "Safety Helmets",
    category: "Tool",
    quantity: 50,
    unit: "units",
    status: "Available",
  },
  {
    id: "res-005",
    siteId: "site-03",
    name: "Concrete Mixer",
    category: "Equipment",
    quantity: 2,
    unit: "units",
    status: "Maintenance",
  },
];
