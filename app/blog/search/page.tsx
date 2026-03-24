import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArticleCard } from "@/components/marketing/article-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pagination } from "@/components/content/pagination";
import { pageHref } from "@/lib/services/discovery-utils";
import { searchBlogArticles } from "@/lib/services/blog";
import { getWebPageStructuredData, toStructuredDataJson } from "@/lib/structured-data";

type BlogSearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateMetadata({
  searchParams,
}: BlogSearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";

  return {
    title: query ? `Cari: ${query}` : "Cari artikel",
    description: query
      ? `Hasil pencarian artikel untuk kata kunci "${query}" di blog Rodex Castello.`
      : "Cari artikel teknis berdasarkan topik, stack, atau kata kunci implementasi.",
    alternates: {
      canonical: query ? `/blog/search?q=${encodeURIComponent(query)}` : "/blog/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function BlogSearchPage({ searchParams }: BlogSearchPageProps) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = sanitizePage(resolvedSearchParams.page);
  const searchResults = await searchBlogArticles({
    query,
    page,
  });
  const currentParams = new URLSearchParams();

  if (query) {
    currentParams.set("q", query);
  }

  const pageLinks = Array.from({ length: searchResults.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref("/blog/search", currentParams, targetPage),
      current: targetPage === searchResults.pagination.page,
    };
  });
  const pageJson = toStructuredDataJson(
    getWebPageStructuredData({
      path: query ? `/blog/search?q=${encodeURIComponent(query)}` : "/blog/search",
      title: query ? `Hasil pencarian: ${query}` : "Cari artikel blog",
      description: query
        ? `Hasil pencarian artikel untuk kata kunci ${query}.`
        : "Cari artikel teknis berdasarkan kata kunci, ringkasan, atau topik implementasi.",
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
                  { label: "Search" },
                ]}
              />

              <div className="content-taxonomy-hero">
                <span className="tag-chip-subtle">Search result</span>
                <h1 className="content-detail-title">
                  {query ? `Hasil pencarian untuk "${query}"` : "Cari artikel teknis"}
                </h1>
                <p className="content-detail-excerpt">
                  Search saat ini memeriksa judul, ringkasan, isi artikel, kategori, dan tag.
                  Struktur query-nya sengaja modular agar mudah dinaikkan ke full-text search di
                  tahap berikutnya.
                </p>
              </div>
            </div>

            <section className="surface-panel rounded-4xl p-6">
              <form action="/blog/search" method="get" className="content-search-form">
                <label className="sr-only" htmlFor="blog-search-page-input">
                  Cari artikel
                </label>
                <input
                  id="blog-search-page-input"
                  type="search"
                  name="q"
                  defaultValue={query}
                  className="field-input"
                  placeholder="Cari Next.js, Go, keamanan, cache..."
                />
                <button type="submit" className="button-primary">
                  Cari
                </button>
              </form>
            </section>

            {searchResults.items.length > 0 ? (
              <>
                <div className="content-list-header">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {searchResults.pagination.totalItems} hasil ditemukan
                    </h2>
                    <p className="copy-muted mt-2 text-sm">
                      Hasil diurutkan berdasarkan kecocokan query dan di-break tie dengan artikel
                      yang paling baru diupdate.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {searchResults.items.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>

                {searchResults.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${searchResults.pagination.page} dari ${searchResults.pagination.totalPages}`}
                    previousHref={
                      searchResults.pagination.hasPreviousPage
                        ? pageHref("/blog/search", currentParams, searchResults.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      searchResults.pagination.hasNextPage
                        ? pageHref("/blog/search", currentParams, searchResults.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>{query ? "Tidak ada artikel yang cocok" : "Masukkan kata kunci pencarian"}</h2>
                <p>
                  {query
                    ? "Coba kata kunci yang lebih umum, buka kategori yang relevan, atau lanjutkan dari artikel terbaru di sidebar."
                    : "Gunakan search untuk mencari artikel berdasarkan judul, ringkasan, isi, kategori, atau tag."}
                </p>
                <div className="content-empty-actions">
                  <Link href="/blog" className="button-secondary">
                    Kembali ke archive
                  </Link>
                </div>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Kategori</h2>
                <div className="content-taxonomy-list">
                  {searchResults.categories.map((category) => (
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
                <h2 className="content-sidebar-title">Tag terkait</h2>
                <div className="content-chip-row">
                  {searchResults.tags.slice(0, 12).map((tag) => (
                    <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
                      #{tag.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Artikel terbaru</h2>
                <div className="content-compact-list">
                  {searchResults.latestArticles.map((article) => (
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJson }} />
    </main>
  );
}

