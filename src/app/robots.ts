import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/trips", "/trip/", "/api/"] }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
