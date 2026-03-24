import { siteConfig } from "./site-config";

function getSocialProfiles() {
  return [siteConfig.githubUrl, siteConfig.linkedinUrl].filter(
    (profile): profile is string => Boolean(profile),
  );
}

export function getHomeStructuredData() {
  const socialProfiles = getSocialProfiles();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.siteUrl}/#website`,
        url: siteConfig.siteUrl,
        name: `${siteConfig.name} Portfolio`,
        description: siteConfig.description,
        inLanguage: "id-ID",
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.siteUrl}/#organization`,
        name: siteConfig.name,
        url: siteConfig.siteUrl,
        description: siteConfig.description,
        sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
      },
      {
        "@type": "Person",
        "@id": `${siteConfig.siteUrl}/#person`,
        name: siteConfig.name,
        url: siteConfig.siteUrl,
        jobTitle: siteConfig.role,
        description:
          "Backend-focused fullstack developer yang membangun aplikasi web modern, dashboard operasional, dan dokumentasi teknis yang rapi.",
        knowsAbout: [
          "PHP",
          "Go",
          "TypeScript",
          "Laravel",
          "Next.js",
          "Gin",
          "GORM",
          "MySQL",
          "PostgreSQL",
          "REST API",
        ],
        sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
      },
    ],
  };
}

export function getHomeStructuredDataJson() {
  return JSON.stringify(getHomeStructuredData()).replace(/</g, "\\u003c");
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function getBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}

export function getArticleStructuredData(article: {
  title: string;
  summary: string;
  slug: string;
  publishedAtISO: string;
  updatedAtISO?: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    inLanguage: "id-ID",
    datePublished: article.publishedAtISO,
    dateModified: article.updatedAtISO ?? article.publishedAtISO,
    articleSection: article.category,
    keywords: article.tags?.join(", "),
    image: article.coverImage ? [`${siteConfig.siteUrl}${article.coverImage}`] : undefined,
    mainEntityOfPage: `${siteConfig.siteUrl}/blog/${article.slug}`,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };
}

export function getCollectionPageStructuredData(options: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.title,
    description: options.description,
    url: `${siteConfig.siteUrl}${options.path}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}/#website`,
    },
  };
}

export function getWebPageStructuredData(options: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: `${siteConfig.siteUrl}${options.path}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.siteUrl}/#website`,
    },
  };
}

export function toStructuredDataJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
