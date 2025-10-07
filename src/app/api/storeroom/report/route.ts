// src/app/api/storeroom/report/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { StoreroomItem, StoreroomReport, ItemCategory, ItemStatus } from "@/types/storeroom";

// GET - Generate storeroom report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const reportType = searchParams.get("reportType") || "all";

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Fetch all items for the company
    let query = db.collection("storeroom").where("companyId", "==", companyId);

    // Apply report type filters
    if (reportType === "low-stock") {
      // Will filter in memory based on quantity vs reorderPoint
    } else if (reportType === "maintenance-due") {
      // Will filter in memory based on nextMaintenanceDate
    } else if (reportType === "decommissioned") {
      query = query.where("status", "==", "decommissioned") as any;
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoreroomItem[];

    // Get company name from first item or fetch from companies collection
    const companyName = items[0]?.companyName || "Unknown Company";

    // Calculate summary statistics
    const summary = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
      itemsByCategory: {} as Record<ItemCategory, number>,
      itemsByStatus: {} as Record<ItemStatus, number>,
      lowStockItems: 0,
      maintenanceDueItems: 0,
      decommissionedItems: 0,
    };

    // Count items by category and status
    items.forEach((item) => {
      // Category count
      summary.itemsByCategory[item.category] = (summary.itemsByCategory[item.category] || 0) + 1;

      // Status count
      summary.itemsByStatus[item.status] = (summary.itemsByStatus[item.status] || 0) + 1;

      // Low stock check (for consumables and PPE)
      if ((item.category === "consumable" || item.category === "ppe") && "quantity" in item) {
        if (item.quantity <= item.reorderPoint) {
          summary.lowStockItems++;
        }
      }

      // Maintenance due check (for tools)
      if (item.category === "tool" && "nextMaintenanceDate" in item) {
        const now = new Date();
        const nextMaintenance = item.nextMaintenanceDate?.toDate();
        if (nextMaintenance && nextMaintenance <= now) {
          summary.maintenanceDueItems++;
        }
      }

      // Decommissioned count
      if (item.status === "decommissioned") {
        summary.decommissionedItems++;
      }
    });

    // Filter items based on report type
    let filteredItems = items;
    if (reportType === "low-stock") {
      filteredItems = items.filter((item) => {
        if ((item.category === "consumable" || item.category === "ppe") && "quantity" in item) {
          return item.quantity <= item.reorderPoint;
        }
        return false;
      });
    } else if (reportType === "maintenance-due") {
      const now = new Date();
      filteredItems = items.filter((item) => {
        if (item.category === "tool" && "nextMaintenanceDate" in item) {
          const nextMaintenance = item.nextMaintenanceDate?.toDate();
          return nextMaintenance && nextMaintenance <= now;
        }
        return false;
      });
    }

    const report: Omit<StoreroomReport, "generatedAt"> & { generatedAt: Date } = {
      companyId,
      companyName,
      generatedAt: new Date(),
      generatedBy: searchParams.get("userId") || "system",
      reportType: reportType as any,
      items: filteredItems,
      summary,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
