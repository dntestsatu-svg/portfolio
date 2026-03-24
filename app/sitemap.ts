import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import {
  getAllBlogArticles,
  getBlogTaxonomies,
  getIndexableBlogTags,
} from "@/lib/services/blog";
import { getProjectSlugs, getProjectTaxonomies } from "@/lib/services/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, articles, blogTaxonomies, projectTaxonomies, indexableTags] = await Promise.all([
    getProjectSlugs(),
    getAllBlogArticles(),
    getBlogTaxonomies(),
    getProjectTaxonomies(),
    getIndexableBlogTags(),
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
    ...projectSlugs.map((slug) => ({
      url: `${siteConfig.siteUrl}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${siteConfig.siteUrl}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAtISO),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...blogTaxonomies.categories.map((category) => ({
      url: `${siteConfig.siteUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })),
    ...indexableTags.map((tag) => ({
      url: `${siteConfig.siteUrl}/blog/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.45,
    })),
    ...projectTaxonomies.categories.map((category) => ({
      url: `${siteConfig.siteUrl}/projects/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })),
  ];
}
