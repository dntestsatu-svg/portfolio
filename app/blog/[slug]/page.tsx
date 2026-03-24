import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicArticleBySlug, getPublicArticles } from "@/lib/services/content";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artikel tidak ditemukan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      url: `/blog/${article.slug}`,
      title: `${article.title} | Rodex Castello`,
      description: article.summary,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
    twitter: {
      title: `${article.title} | Rodex Castello`,
      description: article.summary,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const articles = await getPublicArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <section className="surface-panel rounded-[2rem] p-8">
          <div className="flex flex-wrap gap-3">
            <span className="tag-chip">{article.category}</span>
            <span className="tag-chip-subtle">{article.publishedAt}</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-4xl text-xl leading-9 text-slate-200">{article.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/blog" className="button-secondary">
              Kembali ke archive
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <article className="surface-panel rounded-[2rem] p-8">
            <h2 className="text-2xl font-semibold text-white">Isi artikel</h2>
            <div className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-200">
              {article.content ?? article.summary}
            </div>
          </article>

          <aside className="surface-panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">Metadata artikel</h2>
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tags
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(article.tags ?? []).map((tag) => (
                  <span key={tag} className="tag-chip-subtle">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
