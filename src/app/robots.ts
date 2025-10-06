// /app/robots.ts
import { MetadataRoute } from "next";

export const revalidate = false; // Ensures the robots.txt is compatible with static export

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api"],
      },
    ],
    sitemap: "https://raksms.services/sitemap.xml",
  };
}

