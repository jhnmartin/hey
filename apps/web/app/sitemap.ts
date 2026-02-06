import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.heythursday.app",
      lastModified: new Date(),
    },
    {
      url: "https://www.heythursday.app/dashboard",
      lastModified: new Date(),
    },
  ];
}
