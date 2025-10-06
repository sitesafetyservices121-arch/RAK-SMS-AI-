// /app/sitemap.ts
import { MetadataRoute } from "next";

export const revalidate = false; // Ensures the sitemap is compatible with static export

const staticRoutes: string[] = [
  "",
  "/dashboard",
  "/documents",
  "/generated-documents",
  "/news",
  "/how-to-guide",
  "/employee-training-tracker",
  "/storeroom-tracker",
  "/site-resource-tracker",
  "/vehicle-inspection-tracker",
  "/ppe-issue-register",
  "/toolbox-talks",
  "/sds-management",
  "/she-plan-generator",
  "/hira-generator",
  "/safe-work-procedure",
  "/method-statement",
  "/ltir-analysis",
  "/ohs-consultant",
  "/account/settings",
  "/account/billing",
  "/account/billing/top-up",
  "/support",
  "/admin",
  "/admin/onboarding",
  "/admin/prescription-management",
  "/admin/billing",
  "/admin/document-upload",
  "/admin/create-news",
  "/admin/wilson-training",
  "/admin/model-inspector",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://raksms.services";

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
