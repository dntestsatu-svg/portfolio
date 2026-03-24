import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pagination } from "@/components/content/pagination";
import { ProjectCard } from "@/components/marketing/project-card";
import { pageHref } from "@/lib/services/discovery-utils";
import { searchProjects } from "@/lib/services/projects";
import { getWebPageStructuredData, toStructuredDataJson } from "@/lib/structured-data";

type ProjectSearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateMetadata({
  searchParams,
}: ProjectSearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";

  return {
    title: query ? `Cari project: ${query}` : "Cari project",
    description: query
      ? `Hasil pencarian project untuk kata kunci "${query}" di archive projects Rodex Castello.`
      : "Cari project berdasarkan nama, deskripsi, stack, atau kategori.",
    alternates: {
      canonical: query
        ? `/projects/search?q=${encodeURIComponent(query)}`
        : "/projects/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ProjectSearchPage({ searchParams }: ProjectSearchPageProps) {
  await connection();

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = sanitizePage(resolvedSearchParams.page);
  const searchResults = await searchProjects({
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
      href: pageHref("/projects/search", currentParams, targetPage),
      current: targetPage === searchResults.pagination.page,
    };
  });
  const pageJson = toStructuredDataJson(
    getWebPageStructuredData({
      path: query ? `/projects/search?q=${encodeURIComponent(query)}` : "/projects/search",
      title: query ? `Hasil pencarian project: ${query}` : "Cari project",
      description: query
        ? `Hasil pencarian project untuk kata kunci ${query}.`
        : "Cari project berdasarkan nama, kategori, stack, dan fokus teknis.",
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
                  { label: "Projects", href: "/projects" },
                  { label: "Search" },
                ]}
              />

              <div className="content-taxonomy-hero">
                <span className="tag-chip-subtle">Project search</span>
                <h1 className="content-detail-title">
                  {query ? `Hasil pencarian untuk "${query}"` : "Cari project yang relevan"}
                </h1>
                <p className="content-detail-excerpt">
                  Search project saat ini memeriksa nama, summary, deskripsi, body, kategori, stack,
                  dan feature focus. Query-nya modular dan siap ditingkatkan ke full-text search
                  atau ranking yang lebih canggih saat volume konten bertambah.
                </p>
              </div>
            </div>

            <section className="surface-panel rounded-4xl p-6">
              <form action="/projects/search" method="get" className="content-search-form">
                <label className="sr-only" htmlFor="project-search-page-input">
                  Cari project
                </label>
                <input
                  id="project-search-page-input"
                  type="search"
                  name="q"
                  defaultValue={query}
                  className="field-input"
                  placeholder="Cari backend, CMS, integration, dashboard..."
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
                      {searchResults.pagination.totalItems} project ditemukan
                    </h2>
                    <p className="copy-muted mt-2 text-sm">
                      Hasil diurutkan berdasarkan kecocokan query, lalu di-break tie dengan project
                      yang paling baru diupdate.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  {searchResults.items.map((project) => (
                    <ProjectCard key={project.slug} project={project} variant="compact" />
                  ))}
                </div>

                {searchResults.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${searchResults.pagination.page} dari ${searchResults.pagination.totalPages}`}
                    previousHref={
                      searchResults.pagination.hasPreviousPage
                        ? pageHref("/projects/search", currentParams, searchResults.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      searchResults.pagination.hasNextPage
                        ? pageHref("/projects/search", currentParams, searchResults.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>{query ? "Tidak ada project yang cocok" : "Masukkan kata kunci pencarian"}</h2>
                <p>
                  {query
                    ? "Coba kata kunci yang lebih umum, eksplorasi kategori project, atau gunakan filter stack dari archive utama."
                    : "Gunakan search untuk mencari project berdasarkan problem, stack, atau fokus teknis."}
                </p>
                <div className="content-empty-actions">
                  <Link href="/projects" className="button-secondary">
                    Kembali ke archive
                  </Link>
                </div>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Kategori project</h2>
                <div className="content-taxonomy-list">
                  {searchResults.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/projects/category/${category.slug}`}
                      prefetch={false}
                      className="content-taxonomy-link"
                    >
                      <span>{category.label}</span>
                      <span>{category.count}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Stack shortcut</h2>
                <div className="content-chip-row">
                  {searchResults.stacks.slice(0, 14).map((stack) => (
                    <Link
                      key={stack.slug}
                      href={`/projects?stack=${stack.slug}`}
                      prefetch={false}
                      className="tag-chip-subtle"
                    >
                      {stack.label}
                    </Link>
                  ))}
                </div>
              </section>

              {searchResults.featuredProjects.length > 0 ? (
                <section className="content-sidebar-card">
                  <h2 className="content-sidebar-title">Featured projects</h2>
                  <div className="content-compact-list">
                    {searchResults.featuredProjects.map((project) => (
                      <Link
                        key={project.slug}
                        href={project.href}
                        prefetch={false}
                        className="content-compact-link"
                      >
                        <span className="content-compact-title">{project.name}</span>
                        <span className="content-compact-meta">{project.status.label}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </aside>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJson }} />
    </main>
  );
}

