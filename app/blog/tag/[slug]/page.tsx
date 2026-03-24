import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/marketing/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pagination } from "@/components/content/pagination";
import { pageHref } from "@/lib/services/discovery-utils";
import { getBlogTagPage, getBlogTaxonomies } from "@/lib/services/blog";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type BlogTagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const revalidate = 300;

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateStaticParams() {
  const { tags } = await getBlogTaxonomies();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: BlogTagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagPage = await getBlogTagPage(slug);

  if (!tagPage) {
    return {
      title: "Tag blog tidak ditemukan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `Tag ${tagPage.taxonomy.label}`,
    description: tagPage.description,
    alternates: {
      canonical: `/blog/tag/${tagPage.taxonomy.slug}`,
    },
    robots: {
      index: tagPage.shouldIndex,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: `/blog/tag/${tagPage.taxonomy.slug}`,
      title: `Tag ${tagPage.taxonomy.label} | Blog Rodex Castello`,
      description: tagPage.description,
    },
    twitter: {
      title: `Tag ${tagPage.taxonomy.label} | Blog Rodex Castello`,
      description: tagPage.description,
    },
  };
}

export default async function BlogTagPage({ params, searchParams }: BlogTagPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const tagPage = await getBlogTagPage(slug, { page });

  if (!tagPage) {
    notFound();
  }

  const currentParams = new URLSearchParams();
  const pageLinks = Array.from({ length: tagPage.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref(`/blog/tag/${slug}`, currentParams, targetPage),
      current: targetPage === tagPage.pagination.page,
    };
  });
  const collectionJson = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: `/blog/tag/${tagPage.taxonomy.slug}`,
      title: `Tag ${tagPage.taxonomy.label} | Blog Rodex Castello`,
      description: tagPage.description,
    }),
  );

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <section className="content-shell content-shell--archive">
          <div className="content-main-column space-y-8">
            <div className="surface-panel rounded-[2rem] p-6 md:p-8">
              <Breadcrumbs
                items={[
                  { label: "Blog", href: "/blog" },
                  { label: "Tag", href: "/blog" },
                  { label: tagPage.taxonomy.label },
                ]}
              />

              <div className="content-taxonomy-hero">
                <span className="tag-chip">Tag</span>
                <h1 className="content-detail-title">#{tagPage.taxonomy.label}</h1>
                <p className="content-detail-excerpt">{tagPage.description}</p>
                {!tagPage.shouldIndex ? (
                  <p className="copy-muted text-sm">
                    Halaman tag ini tetap berguna sebagai jalur navigasi, tetapi tidak diindeks jika
                    kontennya masih terlalu tipis untuk mesin pencari.
                  </p>
                ) : null}
              </div>
            </div>

            {tagPage.items.length > 0 ? (
              <>
                <div className="grid gap-5 lg:grid-cols-2">
                  {tagPage.items.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>

                {tagPage.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${tagPage.pagination.page} dari ${tagPage.pagination.totalPages}`}
                    previousHref={
                      tagPage.pagination.hasPreviousPage
                        ? pageHref(`/blog/tag/${slug}`, currentParams, tagPage.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      tagPage.pagination.hasNextPage
                        ? pageHref(`/blog/tag/${slug}`, currentParams, tagPage.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>Belum ada artikel untuk tag ini</h2>
                <p>Gunakan kategori atau pencarian untuk menemukan jalur bacaan lain.</p>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Kategori populer</h2>
                <div className="content-taxonomy-list">
                  {tagPage.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/blog/category/${category.slug}`}
                      className="content-taxonomy-link"
                    >
                      <span>{category.label}</span>
                      <span>{category.count}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Artikel terbaru</h2>
                <div className="content-compact-list">
                  {tagPage.latestArticles.map((article) => (
                    <Link key={article.slug} href={article.href} className="content-compact-link">
                      <span className="content-compact-title">{article.title}</span>
                      <span className="content-compact-meta">{article.category}</span>
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
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />
    </main>
  );
}
