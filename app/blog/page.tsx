import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/marketing/article-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { seedContentNote } from "@/lib/portfolio-data";
import { getPublicArticles } from "@/lib/services/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel, tutorial, dan catatan implementasi project Rodex Castello.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    url: "/blog",
    title: "Blog | Rodex Castello",
    description: "Artikel, tutorial, dan catatan implementasi project Rodex Castello.",
  },
  twitter: {
    title: "Blog | Rodex Castello",
    description: "Artikel, tutorial, dan catatan implementasi project Rodex Castello.",
  },
};

export const revalidate = 300;

export default async function BlogPage() {
  const articles = await getPublicArticles();

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Blog archive"
            title="Artikel dan tutorial yang mendukung kredibilitas teknis portfolio"
            description="Bagian ini dirancang untuk menampung dokumentasi penggunaan project, catatan implementasi, tutorial, dan pemikiran teknis yang relevan bagi recruiter maupun client."
          />
          <Link href="/" className="button-secondary">
            Kembali ke beranda
          </Link>
        </div>

        <p className="copy-muted max-w-4xl text-sm">{seedContentNote}</p>

        <div className="grid gap-5 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}
