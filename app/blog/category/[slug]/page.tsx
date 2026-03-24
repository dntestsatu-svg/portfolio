import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/marketing/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pagination } from "@/components/content/pagination";
import { pageHref } from "@/lib/services/discovery-utils";
import { getBlogCategoryPage, getBlogTaxonomies, type BlogSortOption } from "@/lib/services/blog";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type BlogCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export const revalidate = 300;

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function sanitizeSort(value?: string): BlogSortOption {
  if (value === "latest" || value === "updated" || value === "featured") {
    return value;
  }

  return "latest";
}

export async function generateStaticParams() {
  const { categories } = await getBlogTaxonomies();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryPage = await getBlogCategoryPage(slug);

  if (!categoryPage) {
    return {
      title: "Kategori blog tidak ditemukan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `Kategori ${categoryPage.taxonomy.label}`,
    description: categoryPage.description,
    alternates: {
      canonical: `/blog/category/${categoryPage.taxonomy.slug}`,
    },
    openGraph: {
      type: "website",
      url: `/blog/category/${categoryPage.taxonomy.slug}`,
      title: `${categoryPage.taxonomy.label} | Blog Rodex Castello`,
      description: categoryPage.description,
    },
    twitter: {
      title: `${categoryPage.taxonomy.label} | Blog Rodex Castello`,
      description: categoryPage.description,
    },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const sort = sanitizeSort(resolvedSearchParams.sort);
  const categoryPage = await getBlogCategoryPage(slug, { page, sort });

  if (!categoryPage) {
    notFound();
  }

  const currentParams = new URLSearchParams();
  if (sort !== "latest") {
    currentParams.set("sort", sort);
  }

  const pageLinks = Array.from({ length: categoryPage.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref(`/blog/category/${slug}`, currentParams, targetPage),
      current: targetPage === categoryPage.pagination.page,
    };
  });

  const collectionJson = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: `/blog/category/${categoryPage.taxonomy.slug}`,
      title: `Kategori ${categoryPage.taxonomy.label} | Blog Rodex Castello`,
      description: categoryPage.description,
    }),
  );

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <section className="content-shell content-shell--archive">
          <div className="content-main-column space-y-8">
            <div className="surface-panel rounded-4xl p-6 md:p-8">
              <Breadcrumbs
                items={[
                  { label: "Blog", href: "/blog" },
                  { label: "Kategori", href: "/blog" },
                  { label: categoryPage.taxonomy.label },
                ]}
              />

              <div className="content-taxonomy-hero">
                <span className="tag-chip">Kategori</span>
                <h1 className="content-detail-title">{categoryPage.taxonomy.label}</h1>
                <p className="content-detail-excerpt">{categoryPage.description}</p>
              </div>
            </div>

            {categoryPage.items.length > 0 ? (
              <>
                <div className="grid gap-5 lg:grid-cols-2">
                  {categoryPage.items.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>

                {categoryPage.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${categoryPage.pagination.page} dari ${categoryPage.pagination.totalPages}`}
                    previousHref={
                      categoryPage.pagination.hasPreviousPage
                        ? pageHref(`/blog/category/${slug}`, currentParams, categoryPage.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      categoryPage.pagination.hasNextPage
                        ? pageHref(`/blog/category/${slug}`, currentParams, categoryPage.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>Belum ada artikel di kategori ini</h2>
                <p>Kategori tetap tersedia sebagai taxonomy, tetapi belum ada artikel yang cocok.</p>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Cari di blog</h2>
                <form action="/blog/search" method="get" className="content-search-form">
                  <label className="sr-only" htmlFor="blog-category-search-input">
                    Cari artikel
                  </label>
                  <input
                    id="blog-category-search-input"
                    type="search"
                    name="q"
                    className="field-input"
                    placeholder="Cari artikel..."
                  />
                  <button type="submit" className="button-primary">
                    Cari
                  </button>
                </form>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Tag terkait</h2>
                <div className="content-chip-row">
                  {categoryPage.tags.slice(0, 12).map((tag) => (
                    <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
                      #{tag.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Artikel terbaru</h2>
                <div className="content-compact-list">
                  {categoryPage.latestArticles.map((article) => (
                    <Link key={article.slug} href={article.href} className="content-compact-link">
                      <span className="content-compact-title">{article.title}</span>
                      <span className="content-compact-meta">{article.publishedAt}</span>
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

