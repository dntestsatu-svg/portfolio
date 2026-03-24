import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/marketing/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { CopyLinkButton } from "@/components/content/copy-link-button";
import { MarkdownContent } from "@/components/content/markdown-content";
import { Toc } from "@/components/content/toc";
import {
  getAdjacentArticles,
  getBlogArticleBySlug,
  getBlogSlugs,
  getRelatedArticles,
} from "@/lib/services/blog";
import { siteConfig } from "@/lib/site-config";
import {
  getArticleStructuredData,
  getBreadcrumbStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

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
    keywords: [article.category, ...article.tagsDetailed.map((tag) => tag.label)],
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/blog/${article.slug}`,
      title: `${article.title} | Rodex Castello`,
      description: article.summary,
      publishedTime: article.publishedAtISO,
      modifiedTime: article.updatedAtISO,
      tags: article.tagsDetailed.map((tag) => tag.label),
      images: article.coverImage ? [article.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Rodex Castello`,
      description: article.summary,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [relatedArticles, adjacentArticles] = await Promise.all([
    getRelatedArticles(article.slug, 4),
    getAdjacentArticles(article.slug),
  ]);
  const breadcrumbJson = toStructuredDataJson(
    getBreadcrumbStructuredData([
      { name: "Beranda", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: article.category, path: `/blog/category/${article.categorySlug}` },
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
  );
  const articleJson = toStructuredDataJson(
    getArticleStructuredData({
      title: article.title,
      summary: article.summary,
      slug: article.slug,
      publishedAtISO: article.publishedAtISO,
      updatedAtISO: article.updatedAtISO,
      coverImage: article.coverImage,
      category: article.category,
      tags: article.tagsDetailed.map((tag) => tag.label),
    }),
  );
  const publicUrl = `${siteConfig.siteUrl}/blog/${article.slug}`;

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <section className="content-shell content-shell--detail">
          <div className="content-main-column space-y-8">
            <article className="surface-panel rounded-4xl p-6 md:p-8">
              <Breadcrumbs
                items={[
                  { label: "Blog", href: "/blog" },
                  {
                    label: article.category,
                    href: `/blog/category/${article.categorySlug}`,
                  },
                  { label: article.title },
                ]}
              />

              <div className="content-detail-header">
                <div className="content-detail-meta-row">
                  <Link href={`/blog/category/${article.categorySlug}`} className="tag-chip">
                    {article.category}
                  </Link>
                  <span className="tag-chip-subtle">{article.publishedAt}</span>
                  <span className="tag-chip-subtle">{article.readingTime} menit baca</span>
                  {article.updatedAtISO !== article.publishedAtISO ? (
                    <span className="tag-chip-subtle">
                      Update {article.updatedAtLabel}
                    </span>
                  ) : null}
                </div>

                <h1 className="content-detail-title">{article.title}</h1>
                <p className="content-detail-excerpt">{article.summary}</p>

                <div className="content-chip-row">
                  {article.tagsDetailed.map((tag) => (
                    <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
                      #{tag.label}
                    </Link>
                  ))}
                </div>

                <div className="content-share-row">
                  <CopyLinkButton url={publicUrl} />
                  <Link href="/blog" className="button-secondary">
                    Kembali ke archive
                  </Link>
                </div>
              </div>

              {article.coverImage ? (
                <div className="content-hero-image mt-8">
                  <Image
                    src={article.coverImage}
                    alt={`Cover ${article.title}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 70vw, 100vw"
                  />
                </div>
              ) : null}
            </article>

            {article.headings.length > 0 ? (
              <section className="surface-panel content-mobile-only rounded-4xl p-5">
                <Toc headings={article.headings} variant="mobile" />
              </section>
            ) : null}

            <article className="surface-panel rounded-4xl p-6 md:p-8">
              <div className="content-article-meta-banner">
                <div>
                  <p className="content-sidebar-title">Context cepat</p>
                  <p className="copy-muted mt-2 text-sm">
                    Artikel ini berada di kategori{" "}
                    <Link href={`/blog/category/${article.categorySlug}`}>{article.category}</Link>{" "}
                    dan bisa diteruskan ke topik serupa lewat tag, artikel terkait, serta navigasi
                    previous/next di bawah.
                  </p>
                </div>
              </div>

              <MarkdownContent content={article.preparedContent} className="markdown-prose" />
            </article>

            {relatedArticles.length > 0 ? (
              <section className="space-y-5">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Artikel terkait
                  </h2>
                  <p className="copy-muted text-sm">
                    Dipilih berdasarkan kategori yang sama, overlap tag, dan fallback ke artikel
                    terbaru yang masih relevan jika kandidat kuat terlalu sedikit.
                  </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {relatedArticles.map((relatedArticle) => (
                    <ArticleCard key={relatedArticle.slug} article={relatedArticle} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="content-prev-next-grid">
              {adjacentArticles.previousArticle ? (
                <Link
                  href={adjacentArticles.previousArticle.href}
                  className="content-prev-next-card"
                >
                  <span className="content-prev-next-label">Artikel sebelumnya</span>
                  <strong>{adjacentArticles.previousArticle.title}</strong>
                  <span>{adjacentArticles.previousArticle.category}</span>
                </Link>
              ) : (
                <div className="content-prev-next-card is-empty">
                  <span className="content-prev-next-label">Artikel sebelumnya</span>
                  <strong>Belum ada artikel yang lebih lama.</strong>
                </div>
              )}

              {adjacentArticles.nextArticle ? (
                <Link href={adjacentArticles.nextArticle.href} className="content-prev-next-card">
                  <span className="content-prev-next-label">Artikel berikutnya</span>
                  <strong>{adjacentArticles.nextArticle.title}</strong>
                  <span>{adjacentArticles.nextArticle.category}</span>
                </Link>
              ) : (
                <div className="content-prev-next-card is-empty">
                  <span className="content-prev-next-label">Artikel berikutnya</span>
                  <strong>Ini artikel terbaru di jalur ini.</strong>
                </div>
              )}
            </section>
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack is-sticky">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Ringkasan artikel</h2>
                <dl className="content-definition-list">
                  <div>
                    <dt>Publish</dt>
                    <dd>{article.publishedAt}</dd>
                  </div>
                  <div>
                    <dt>Update</dt>
                    <dd>{article.updatedAtLabel}</dd>
                  </div>
                  <div>
                    <dt>Durasi baca</dt>
                    <dd>{article.readingTime} menit</dd>
                  </div>
                  <div>
                    <dt>Kategori</dt>
                    <dd>
                      <Link href={`/blog/category/${article.categorySlug}`}>{article.category}</Link>
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="content-sidebar-card content-desktop-only">
                <Toc headings={article.headings} />
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Lanjut baca</h2>
                <div className="content-compact-list">
                  {relatedArticles.slice(0, 4).map((relatedArticle) => (
                    <Link
                      key={relatedArticle.slug}
                      href={relatedArticle.href}
                      className="content-compact-link"
                    >
                      <span className="content-compact-title">{relatedArticle.title}</span>
                      <span className="content-compact-meta">
                        {relatedArticle.category} · {relatedArticle.readingTime} menit baca
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJson }} />
    </main>
  );
}

