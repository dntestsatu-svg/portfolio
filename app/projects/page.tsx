import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/content/pagination";
import { ProjectCard } from "@/components/marketing/project-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { getProjectsArchive, type ProjectSortOption } from "@/lib/services/projects";
import { pageHref } from "@/lib/services/discovery-utils";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Archive studi kasus project Mugiew Castello dengan jalur pencarian, filter stack, kategori, dan detail implementasi yang lebih matang.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    type: "website",
    url: "/projects",
    title: "Projects | Mugiew Castello",
    description:
      "Archive studi kasus project Mugiew Castello dengan jalur pencarian, filter stack, kategori, dan detail implementasi yang lebih matang.",
  },
  twitter: {
    title: "Projects | Mugiew Castello",
    description:
      "Archive studi kasus project Mugiew Castello dengan jalur pencarian, filter stack, kategori, dan detail implementasi yang lebih matang.",
  },
};

export const revalidate = 300;

const sortOptions: Array<{ value: ProjectSortOption; label: string }> = [
  { value: "featured", label: "Unggulan" },
  { value: "latest", label: "Terbaru" },
  { value: "updated", label: "Terakhir diupdate" },
];

type ProjectsPageProps = {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    stack?: string;
  }>;
};

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function sanitizeSort(value?: string): ProjectSortOption {
  if (value === "featured" || value === "latest" || value === "updated") {
    return value;
  }

  return "featured";
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const sort = sanitizeSort(resolvedSearchParams.sort);
  const stack = resolvedSearchParams.stack?.trim() ?? "";
  const archive = await getProjectsArchive({
    page,
    sort,
    stack: stack || undefined,
  });
  const currentParams = new URLSearchParams();

  if (sort !== "featured") {
    currentParams.set("sort", sort);
  }

  if (stack) {
    currentParams.set("stack", stack);
  }

  const pageLinks = Array.from({ length: archive.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref("/projects", currentParams, targetPage),
      current: targetPage === archive.pagination.page,
    };
  });
  const collectionJson = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: "/projects",
      title: "Projects | Mugiew Castello",
      description:
        "Archive studi kasus project yang membantu pengunjung menjelajahi sistem backend, dashboard, integrasi, dan produk berbasis konten secara lebih terarah.",
    }),
  );
  const leadFeaturedProject = !stack && page === 1 ? archive.featuredProjects[0] : null;
  const secondaryFeaturedProjects = leadFeaturedProject
    ? archive.featuredProjects.slice(1)
    : archive.featuredProjects;

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-10">
        <section className="content-shell content-shell--archive">
          <div className="content-main-column space-y-8">
            <SectionHeading
              eyebrow="Project system"
              title="Archive project yang terasa seperti sistem studi kasus, bukan daftar card statis"
              description="Halaman ini dirancang agar pengunjung bisa menemukan project berdasarkan fokus teknis, kategori, stack utama, dan jalur lanjutan ke detail case study yang lebih serius."
            />

            <div className="content-toolbar">
              <div className="content-sort-group" aria-label="Urutkan project">
                {sortOptions.map((option) => {
                  const params = new URLSearchParams();
                  if (option.value !== "featured") {
                    params.set("sort", option.value);
                  }
                  if (stack) {
                    params.set("stack", stack);
                  }

                  return (
                    <Link
                      key={option.value}
                      href={pageHref("/projects", params, 1)}
                      prefetch={false}
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

              {stack ? (
                <Link href="/projects" className="button-secondary">
                  Reset filter stack
                </Link>
              ) : (
                <Link href="/" className="button-secondary">
                  Kembali ke beranda
                </Link>
              )}
            </div>

            <section className="surface-panel content-mobile-only rounded-4xl p-5">
              <div className="content-section-heading">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Cari jalur yang paling relevan
                </h2>
                <p className="copy-muted text-sm">
                  Gunakan pencarian atau filter stack terlebih dulu. Ini lebih cepat daripada
                  membaca semua case study satu per satu di layar kecil.
                </p>
              </div>

              <form action="/projects/search" method="get" className="content-search-form mt-5">
                <label className="sr-only" htmlFor="project-search-input-mobile">
                  Cari project
                </label>
                <input
                  id="project-search-input-mobile"
                  type="search"
                  name="q"
                  className="field-input"
                  placeholder="Cari API, dashboard, CMS..."
                />
                <button type="submit" className="button-primary">
                  Cari project
                </button>
              </form>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="content-sidebar-title">Filter stack</p>
                  <div className="content-chip-row mt-3">
                    {archive.stacks.slice(0, 8).map((stackItem) => (
                      <Link
                        key={stackItem.slug}
                        href={`/projects?stack=${stackItem.slug}`}
                        prefetch={false}
                        className={
                          archive.activeStack === stackItem.slug ? "tag-chip" : "tag-chip-subtle"
                        }
                      >
                        {stackItem.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="content-sidebar-title">Kategori cepat</p>
                  <div className="content-chip-row mt-3">
                    {archive.categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.slug}
                        href={`/projects/category/${category.slug}`}
                        prefetch={false}
                        className="tag-chip-subtle"
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {!stack && page === 1 && archive.featuredProjects.length > 0 ? (
              <section className="space-y-5">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Featured case studies
                  </h2>
                  <p className="copy-muted text-sm">
                    Project unggulan dipilih untuk memperlihatkan kedalaman problem, fokus teknis,
                    dan jalur implementasi yang paling representatif.
                  </p>
                </div>

                {leadFeaturedProject ? (
                  <article className="content-feature-card">
                    <div className="content-feature-copy">
                      <span className="tag-chip">Mulai dari sini</span>
                      <div className="content-feature-meta">
                        <span>{leadFeaturedProject.category}</span>
                        <span>{leadFeaturedProject.status.label}</span>
                        <span>Update {leadFeaturedProject.updatedAtLabel}</span>
                      </div>
                      <h3 className="content-feature-title">{leadFeaturedProject.name}</h3>
                      <p className="content-feature-summary">{leadFeaturedProject.summary}</p>
                      <div className="content-chip-row">
                        {leadFeaturedProject.technicalFocus.slice(0, 3).map((focus) => (
                          <span key={focus} className="tag-chip-subtle">
                            {focus}
                          </span>
                        ))}
                      </div>
                      <div className="content-feature-actions">
                        <Link
                          href={leadFeaturedProject.href}
                          prefetch={false}
                          className="button-primary"
                        >
                          Buka case study utama
                        </Link>
                        {leadFeaturedProject.tutorialUrl ? (
                          <Link
                            href={leadFeaturedProject.tutorialUrl}
                            prefetch={false}
                            className="button-secondary"
                          >
                            Lanjut ke tutorial
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ) : null}

                {secondaryFeaturedProjects.length > 0 ? (
                  <div className="grid gap-5 xl:grid-cols-2">
                    {secondaryFeaturedProjects.map((project) => (
                      <ProjectCard key={project.slug} project={project} variant="compact" />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {archive.items.length > 0 ? (
              <>
                <div className="content-list-header">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {stack
                        ? `Project dengan stack ${archive.stacks.find((item) => item.slug === stack)?.label ?? stack}`
                        : "Semua project"}
                    </h2>
                    <p className="copy-muted mt-2 text-sm">
                      Menampilkan {archive.pagination.totalItems} project yang bisa dijelajahi
                      berdasarkan kategori, stack utama, dan detail case study.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  {archive.items.map((project) => (
                    <ProjectCard key={project.slug} project={project} variant="compact" />
                  ))}
                </div>

                {archive.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${archive.pagination.page} dari ${archive.pagination.totalPages}`}
                    previousHref={
                      archive.pagination.hasPreviousPage
                        ? pageHref("/projects", currentParams, archive.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      archive.pagination.hasNextPage
                        ? pageHref("/projects", currentParams, archive.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>Tidak ada project yang cocok dengan filter ini</h2>
                <p>
                  Coba gunakan kategori lain, buka pencarian project, atau reset filter stack untuk
                  kembali ke archive penuh.
                </p>
                <div className="content-empty-actions">
                  <Link href="/projects/search" className="button-primary">
                    Cari project
                  </Link>
                  <Link href="/projects" className="button-secondary">
                    Reset archive
                  </Link>
                </div>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column content-desktop-only">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Cari project</h2>
                <form action="/projects/search" method="get" className="content-search-form">
                  <label className="sr-only" htmlFor="project-search-input">
                    Cari project
                  </label>
                  <input
                    id="project-search-input"
                    type="search"
                    name="q"
                    className="field-input"
                    placeholder="Cari API, dashboard, CMS..."
                  />
                  <button type="submit" className="button-primary">
                    Cari
                  </button>
                </form>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Filter stack</h2>
                <div className="content-chip-row">
                  {archive.stacks.slice(0, 14).map((stackItem) => (
                    <Link
                      key={stackItem.slug}
                      href={`/projects?stack=${stackItem.slug}`}
                      prefetch={false}
                      className={
                        archive.activeStack === stackItem.slug ? "tag-chip" : "tag-chip-subtle"
                      }
                    >
                      {stackItem.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Kategori project</h2>
                <div className="content-taxonomy-list">
                  {archive.categories.map((category) => (
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

              {archive.featuredProjects.length > 0 ? (
                <section className="content-sidebar-card">
                  <h2 className="content-sidebar-title">Shortcut unggulan</h2>
                  <div className="content-compact-list">
                    {archive.featuredProjects.map((project) => (
                      <Link
                        key={project.slug}
                        href={project.href}
                        prefetch={false}
                        className="content-compact-link"
                      >
                        <span className="content-compact-title">{project.name}</span>
                        <span className="content-compact-meta">
                          {project.category} · {project.status.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
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
