import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pagination } from "@/components/content/pagination";
import { ProjectCard } from "@/components/marketing/project-card";
import { pageHref } from "@/lib/services/discovery-utils";
import {
  getProjectCategoryPage,
  getProjectTaxonomies,
  type ProjectSortOption,
} from "@/lib/services/projects";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type ProjectCategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export const revalidate = 300;

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

export async function generateStaticParams() {
  const { categories } = await getProjectTaxonomies();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: ProjectCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryPage = await getProjectCategoryPage(slug);

  if (!categoryPage) {
    return {
      title: "Kategori project tidak ditemukan",
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
      canonical: `/projects/category/${categoryPage.taxonomy.slug}`,
    },
    openGraph: {
      type: "website",
      url: `/projects/category/${categoryPage.taxonomy.slug}`,
      title: `${categoryPage.taxonomy.label} | Projects Rodex Castello`,
      description: categoryPage.description,
    },
    twitter: {
      title: `${categoryPage.taxonomy.label} | Projects Rodex Castello`,
      description: categoryPage.description,
    },
  };
}

export default async function ProjectCategoryPage({
  params,
  searchParams,
}: ProjectCategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const sort = sanitizeSort(resolvedSearchParams.sort);
  const categoryPage = await getProjectCategoryPage(slug, { page, sort });

  if (!categoryPage) {
    notFound();
  }

  const currentParams = new URLSearchParams();
  if (sort !== "featured") {
    currentParams.set("sort", sort);
  }

  const pageLinks = Array.from({ length: categoryPage.pagination.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref(`/projects/category/${slug}`, currentParams, targetPage),
      current: targetPage === categoryPage.pagination.page,
    };
  });
  const collectionJson = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: `/projects/category/${categoryPage.taxonomy.slug}`,
      title: `Kategori ${categoryPage.taxonomy.label} | Projects Rodex Castello`,
      description: categoryPage.description,
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
                  { label: "Projects", href: "/projects" },
                  { label: "Kategori", href: "/projects" },
                  { label: categoryPage.taxonomy.label },
                ]}
              />

              <div className="content-taxonomy-hero">
                <span className="tag-chip">Kategori project</span>
                <h1 className="content-detail-title">{categoryPage.taxonomy.label}</h1>
                <p className="content-detail-excerpt">{categoryPage.description}</p>
              </div>
            </div>

            {categoryPage.items.length > 0 ? (
              <>
                <div className="grid gap-5 xl:grid-cols-2">
                  {categoryPage.items.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>

                {categoryPage.pagination.totalPages > 1 ? (
                  <Pagination
                    summary={`Halaman ${categoryPage.pagination.page} dari ${categoryPage.pagination.totalPages}`}
                    previousHref={
                      categoryPage.pagination.hasPreviousPage
                        ? pageHref(`/projects/category/${slug}`, currentParams, categoryPage.pagination.page - 1)
                        : null
                    }
                    nextHref={
                      categoryPage.pagination.hasNextPage
                        ? pageHref(`/projects/category/${slug}`, currentParams, categoryPage.pagination.page + 1)
                        : null
                    }
                    links={pageLinks}
                  />
                ) : null}
              </>
            ) : (
              <section className="content-empty-state">
                <h2>Belum ada project di kategori ini</h2>
                <p>Kategori tetap disiapkan sebagai jalur eksplorasi, tetapi kontennya belum ada.</p>
              </section>
            )}
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Cari project</h2>
                <form action="/projects/search" method="get" className="content-search-form">
                  <label className="sr-only" htmlFor="project-category-search-input">
                    Cari project
                  </label>
                  <input
                    id="project-category-search-input"
                    type="search"
                    name="q"
                    className="field-input"
                    placeholder="Cari CMS, API, dashboard..."
                  />
                  <button type="submit" className="button-primary">
                    Cari
                  </button>
                </form>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Stack shortcut</h2>
                <div className="content-chip-row">
                  {categoryPage.stacks.slice(0, 14).map((stack) => (
                    <Link key={stack.slug} href={`/projects?stack=${stack.slug}`} className="tag-chip-subtle">
                      {stack.label}
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
