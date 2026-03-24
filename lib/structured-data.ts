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
