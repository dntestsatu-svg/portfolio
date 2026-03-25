import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/marketing/article-card";
import { Pagination } from "@/components/content/pagination";
import { SectionHeading } from "@/components/marketing/section-heading";
import { pageHref } from "@/lib/services/discovery-utils";
import { getBlogArchive, type BlogSortOption } from "@/lib/services/blog";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Archive artikel teknis Mugiew Castello: tutorial, catatan implementasi, dan pembahasan engineering yang SEO-aware dan production-minded.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "Blog | Mugiew Castello",
    description:
      "Archive artikel teknis Mugiew Castello: tutorial, catatan implementasi, dan pembahasan engineering yang SEO-aware dan production-minded.",
  },
  twitter: {
    title: "Blog | Mugiew Castello",
    description:
      "Archive artikel teknis Mugiew Castello: tutorial, catatan implementasi, dan pembahasan engineering yang SEO-aware dan production-minded.",
  },
};

export const revalidate = 300;

const sortOptions: Array<{ value: BlogSortOption; label: string }> = [
  { value: "featured", label: "Unggulan" },
  { value: "latest", label: "Terbaru" },
  { value: "updated", label: "Terakhir diupdate" },
];

type BlogArchivePageProps = {
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
};

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function sanitizeSort(value?: string): BlogSortOption {
  if (value === "latest" || value === "updated" || value === "featured") {
    return value;
  }

  return "featured";
}

export default async function BlogPage({ searchParams }: BlogArchivePageProps) {
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const sort = sanitizeSort(resolvedSearchParams.sort);
  const currentParams = new URLSearchParams();

  if (sort !== "featured") {
    currentParams.set("sort", sort);
  }

  const archive = await getBlogArchive({
    page,
    sort,
  });

  const pageLinks = Array.from({ length: archive.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref("/blog", currentParams, targetPage),
      current: targetPage === archive.pagination.page,
    };
  });

  const collectionJson = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: "/blog",
      title: "Blog | Mugiew Castello",
      description:
        "Archive artikel teknis yang memudahkan pengunjung menemukan tutorial, catatan implementasi, dan eksplorasi engineering dari berbagai kategori.",
    }),
  );
  const mobileFeaturedTags = archive.tags.slice(0, 8);

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-10">
        <section className="content-shell content-shell--archive">
          <div className="content-main-column space-y-8">
            <SectionHeading
              eyebrow="Blog system"
              title="Archive artikel teknis yang bisa dijelajahi, dicari, dan dihubungkan antar topik"
              description="Bagian blog dibangun sebagai sistem konten yang membantu pengunjung menemukan artikel unggulan, topik terstruktur, dan jalur lanjutan ke konten lain yang masih relevan."
            />

            <div className="content-toolbar">
              <div className="content-sort-group" aria-label="Urutkan artikel">
                {sortOptions.map((option) => {
                  const params = new URLSearchParams();
                  if (option.value !== "featured") {
                    params.set("sort", option.value);
                  }

                  return (
                    <Link
                      key={option.value}
                      href={pageHref("/blog", params, 1)}
                      aria-current={sort === option.value ? "page" : undefined}
                      className={
                        sort === option.value
                          ? "content-pill-button is-active"
                          : "content-pill-button"
                      }
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </div>

              <Link href="/" className="button-secondary">
                Kembali ke beranda
              </Link>
            </div>

            <section className="surface-panel content-mobile-only rounded-4xl p-5">
              <div className="content-section-heading">
                <h2 className="text-xl font-semibold tracking-tight text-white">Mulai dari sini</h2>
                <p className="copy-muted text-sm">
                  Cari topik, pilih kategori, lalu lanjut ke artikel yang paling relevan tanpa harus
                  scroll panjang ke bagian bawah.
                </p>
              </div>

              <form action="/blog/search" method="get" className="content-search-form mt-5">
                <label className="sr-only" htmlFor="blog-search-input-mobile">
                  Cari artikel
                </label>
                <input
                  id="blog-search-input-mobile"
                  type="search"
                  name="q"
                  className="field-input"
                  placeholder="Cari Next.js, PHP, keamanan..."
                />
                <button type="submit" className="button-primary">
                  Cari artikel
                </button>
              </form>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="content-sidebar-title">Kategori cepat</p>
                  <div className="content-chip-row mt-3">
                    {archive.categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.slug}
                        href={`/blog/category/${category.slug}`}
                        className="tag-chip-subtle"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {mobileFeaturedTags.length > 0 ? (
                  <div>
                    <p className="content-sidebar-title">Topik populer</p>
                    <div className="content-chip-row mt-3">
                      {mobileFeaturedTags.map((tag) => (
                        <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
                          #{tag.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {page === 1 && archive.featuredArticle ? (
              <article className="content-feature-card">
                <div className="content-feature-copy">
                  <span className="tag-chip">Featured article</span>
                  <div className="content-feature-meta">
                    <span>{archive.featuredArticle.category}</span>
                    <span>{archive.featuredArticle.publishedAt}</span>
                    <span>{archive.featuredArticle.readingTime} menit baca</span>
                  </div>
                  <h2 className="content-feature-title">{archive.featuredArticle.title}</h2>
                  <p className="content-feature-summary">{archive.featuredArticle.summary}</p>
                  <div className="content-chip-row">
                    {archive.featuredArticle.tagsDetailed.slice(0, 4).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/blog/tag/${tag.slug}`}
                        className="tag-chip-subtle"
                      >
                        #{tag.label}
                      </Link>
                    ))}
                  </div>
                  <div className="content-feature-actions">
                    <Link href={archive.featuredArticle.href} className="button-primary">
                      Baca artikel unggulan
                    </Link>
                    <Link
                      href={`/blog/category/${archive.featuredArticle.categorySlug}`}
                      className="button-secondary"
                    >
                      Jelajahi kategori
                    </Link>
                  </div>
                </div>
              </article>
            ) : null}

            {archive.items.length > 0 ? (
              <>
                <div className="content-list-header">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      Semua artikel
                    </h2>
                    <p className="copy-muted mt-2 text-sm">
                      Menampilkan {archive.pagination.totalItems} artikel yang bisa dijelajahi
                      berdasarkan topik, tag, dan kebutuhan bacaan berikutnya.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {archive.items.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>

                {archive.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${archive.pagination.page} dari ${archive.pagination.totalPages}`}
                    previousHref={
                      archive.pagination.hasPreviousPage
                        ? pageHref("/blog", currentParams, archive.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      archive.pagination.hasNextPage
                        ? pageHref("/blog", currentParams, archive.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>Belum ada artikel yang cocok untuk ditampilkan</h2>
                <p>
                  Archive akan menampilkan artikel berdasarkan urutan yang dipilih. Coba gunakan
                  pencarian atau masuk ke kategori yang relevan untuk menjelajahi topik lain.
                </p>
                <div className="content-empty-actions">
                  <Link href="/blog/search" className="button-primary">
                    Cari artikel
                  </Link>
                  <Link href="/blog" className="button-secondary">
                    Reset archive
                  </Link>
                </div>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column content-desktop-only">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Cari artikel</h2>
                <form action="/blog/search" method="get" className="content-search-form">
                  <label className="sr-only" htmlFor="blog-search-input">
                    Cari artikel
                  </label>
                  <input
                    id="blog-search-input"
                    type="search"
                    name="q"
                    className="field-input"
                    placeholder="Cari Next.js, PHP, keamanan..."
                  />
                  <button type="submit" className="button-primary">
                    Cari
                  </button>
                </form>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Kategori</h2>
                <div className="content-taxonomy-list">
                  {archive.categories.map((category) => (
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
                <h2 className="content-sidebar-title">Topik yang sering muncul</h2>
                <div className="content-chip-row">
                  {archive.tags.slice(0, 12).map((tag) => (
                    <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
                      #{tag.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Artikel terbaru</h2>
                <div className="content-compact-list">
                  {archive.latestArticles.map((article) => (
                    <Link key={article.slug} href={article.href} className="content-compact-link">
                      <span className="content-compact-title">{article.title}</span>
                      <span className="content-compact-meta">
                        {article.category} · {article.readingTime} menit baca
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
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />
    </main>
  );
}
