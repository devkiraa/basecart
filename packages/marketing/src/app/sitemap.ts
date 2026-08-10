import { MetadataRoute } from "next";
import { COMPETITORS, COMPARE_PAIRS } from "../data/competitors";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://basecart.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      // Machine-readable pricing for AI agents
      url: `${baseUrl}/pricing.md`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      // AI context file (llms.txt convention)
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const vsPages: MetadataRoute.Sitemap = COMPETITORS.map((c) => ({
    url: `${baseUrl}/vs/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const comparePages: MetadataRoute.Sitemap = COMPARE_PAIRS.map((p) => ({
    url: `${baseUrl}/compare/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...vsPages, ...comparePages];
}
