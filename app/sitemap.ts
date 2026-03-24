import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getPublicArticles, getPublicProjects } from "@/lib/services/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles] = await Promise.all([
    getPublicProjects(),
    getPublicArticles(),
  ]);

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...projects.map((project) => ({
      url: `${siteConfig.siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${siteConfig.siteUrl}/blog/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];
}
