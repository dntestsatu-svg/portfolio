import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/marketing/project-card";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { CopyLinkButton } from "@/components/content/copy-link-button";
import { MarkdownContent } from "@/components/content/markdown-content";
import { SupportContextCta } from "@/components/support/support-context-cta";
import {
  getProjectBySlug,
  getProjectSlugs,
  getRelatedProjectArticles,
  getRelatedProjects,
} from "@/lib/services/projects";
import { siteConfig } from "@/lib/site-config";
import {
  getBreadcrumbStructuredData,
  getWebPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project tidak ditemukan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: project.name,
    description: project.summary,
    keywords: [project.category, ...project.stackDetailed.map((stack) => stack.label)],
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "website",
      url: `/projects/${project.slug}`,
      title: `${project.name} | Rodex Castello`,
      description: project.summary,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Rodex Castello`,
      description: project.summary,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const [relatedProjects, relatedArticles] = await Promise.all([
    getRelatedProjects(project.slug, 4),
    getRelatedProjectArticles(project.slug, 3),
  ]);
  const breadcrumbJson = toStructuredDataJson(
    getBreadcrumbStructuredData([
      { name: "Beranda", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.category, path: `/projects/category/${project.categorySlug}` },
      { name: project.name, path: `/projects/${project.slug}` },
    ]),
  );
  const pageJson = toStructuredDataJson(
    getWebPageStructuredData({
      path: `/projects/${project.slug}`,
      title: `${project.name} | Rodex Castello`,
      description: project.summary,
    }),
  );
  const publicUrl = `${siteConfig.siteUrl}/projects/${project.slug}`;
  const projectProblem = project.problemContext ?? project.description;
  const projectSolution = project.solutionBuilt ?? project.summary;
  const roleSummary =
    project.roleSummary ??
    "Fokus pengerjaan berada pada struktur data, alur delivery, dan keputusan implementasi yang menjaga sistem tetap jelas untuk dikembangkan lebih lanjut.";
  const architectureHighlights =
    project.architectureHighlights && project.architectureHighlights.length > 0
      ? project.architectureHighlights
      : project.technicalFocus;
  const decisionNotes =
    project.decisionNotes && project.decisionNotes.length > 0
      ? project.decisionNotes
      : project.features.slice(0, 3);
  const impactHighlights = project.impactHighlights ?? [];

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <section className="content-shell content-shell--detail">
          <div className="content-main-column space-y-8">
            <section className="surface-panel rounded-4xl p-6 md:p-8">
              <Breadcrumbs
                items={[
                  { label: "Projects", href: "/projects" },
                  {
                    label: project.category,
                    href: `/projects/category/${project.categorySlug}`,
                  },
                  { label: project.name },
                ]}
              />

              <div className="content-detail-header">
                <div className="content-detail-meta-row">
                  <Link href={`/projects/category/${project.categorySlug}`} className="tag-chip">
                    {project.category}
                  </Link>
                  <span
                    className={`content-status-badge tone-${project.status.tone}`}
                    aria-label={`Status ${project.status.label}`}
                  >
                    {project.status.label}
                  </span>
                  <span className="tag-chip-subtle">Update {project.updatedAtLabel}</span>
                </div>

                <h1 className="content-detail-title">{project.name}</h1>
                <p className="content-detail-excerpt">{project.summary}</p>
                <p className="copy-muted text-base">{project.description}</p>

                <div className="content-chip-row">
                  {project.stackDetailed.map((stack) => (
                    <Link
                      key={stack.slug}
                      href={`/projects?stack=${stack.slug}`}
                      className="tag-chip-subtle"
                    >
                      {stack.label}
                    </Link>
                  ))}
                </div>

                <div className="content-share-row">
                  <CopyLinkButton url={publicUrl} />
                  {project.demoUrl ? (
                    <Link href={project.demoUrl} className="button-primary">
                      Live demo
                    </Link>
                  ) : null}
                  {project.repoUrl ? (
                    <Link href={project.repoUrl} className="button-secondary">
                      Repository
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="content-mobile-only mt-6">
                <SupportContextCta context="project" layout="inline" />
              </div>

              <div className="content-hero-image mt-8">
                <Image
                  src={project.thumbnail}
                  alt={project.thumbnailAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 70vw, 100vw"
                />
              </div>
            </section>

            <section className="surface-panel content-mobile-only rounded-4xl p-5">
              <div className="content-section-heading">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Quick facts & links
                </h2>
                <p className="copy-muted text-sm">
                  Ringkasan ringkas untuk membantu pembaca mobile memahami konteks utama tanpa
                  turun ke bagian sidebar desktop.
                </p>
              </div>

              <dl className="content-definition-list">
                <div>
                  <dt>Status</dt>
                  <dd>{project.status.label}</dd>
                </div>
                {project.roleLabel ? (
                  <div>
                    <dt>Peran</dt>
                    <dd>{project.roleLabel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Update terakhir</dt>
                  <dd>{project.updatedAtLabel}</dd>
                </div>
                <div>
                  <dt>Fokus</dt>
                  <dd>{project.technicalFocus[0] ?? "Case study"}</dd>
                </div>
              </dl>

              {(project.demoUrl || project.repoUrl || project.tutorialUrl) ? (
                <div className="content-compact-list mt-5">
                  {project.demoUrl ? (
                    <Link href={project.demoUrl} className="content-compact-link">
                      <span className="content-compact-title">Live demo</span>
                      <span className="content-compact-meta">Versi publik project</span>
                    </Link>
                  ) : null}
                  {project.repoUrl ? (
                    <Link href={project.repoUrl} className="content-compact-link">
                      <span className="content-compact-title">Repository</span>
                      <span className="content-compact-meta">
                        Kode sumber atau referensi implementasi
                      </span>
                    </Link>
                  ) : null}
                  {project.tutorialUrl ? (
                    <Link href={project.tutorialUrl} className="content-compact-link">
                      <span className="content-compact-title">Tutorial terkait</span>
                      <span className="content-compact-meta">
                        Panduan penggunaan atau implementasi
                      </span>
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="surface-panel rounded-4xl p-6 md:p-8">
              <div className="content-section-heading">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Ringkasan problem dan solusi
                </h2>
                <p className="copy-muted text-sm">
                  Bagian ini menempatkan project sebagai case study: masalah yang dihadapi, solusi
                  yang dibangun, serta alasan teknis di balik keputusan implementasi.
                </p>
              </div>

              <div className="content-case-grid">
                <section className="content-case-section">
                  <h3>Context operasional</h3>
                  <p>{projectProblem}</p>
                </section>

                <section className="content-case-section">
                  <h3>Solution built</h3>
                  <p>{projectSolution}</p>
                </section>

                <section className="content-case-section">
                  <h3>Peran dan scope delivery</h3>
                  <p>{roleSummary}</p>
                </section>
              </div>
            </section>

            {impactHighlights.length > 0 ? (
              <section className="surface-panel rounded-4xl p-6 md:p-8">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Impact dan hasil yang terasa
                  </h2>
                  <p className="copy-muted text-sm">
                    Bagian ini merangkum apa yang benar-benar membaik setelah struktur, workflow,
                    atau delivery di project ini dirapikan.
                  </p>
                </div>

                <div className="content-impact-grid mt-6">
                  {impactHighlights.map((item) => (
                    <article key={`${item.label}-${item.value}`} className="content-impact-card">
                      <p className="content-impact-label">{item.label}</p>
                      <h3 className="content-impact-value">{item.value}</h3>
                      <p className="copy-muted text-sm">{item.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="surface-panel rounded-4xl p-6 md:p-8">
              <div className="content-section-heading">
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Architecture dan technical decisions
                </h2>
                <p className="copy-muted text-sm">
                  Detail implementasi, arsitektur modul, keputusan teknis, serta trade-off yang
                  membuat project ini relevan sebagai studi kasus.
                </p>
              </div>

              <div className="content-case-grid mb-6">
                <section className="content-case-section">
                  <h3>Architecture highlights</h3>
                  <ul>
                    {architectureHighlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </section>

                <section className="content-case-section">
                  <h3>Decision notes</h3>
                  <ul>
                    {decisionNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <MarkdownContent content={project.body ?? project.description} className="markdown-prose" />
            </section>

            {project.lessonsLearned ? (
              <section className="surface-panel rounded-4xl p-6 md:p-8">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Lessons learned
                  </h2>
                  <p className="copy-muted text-sm">
                    Insight ringkas yang merangkum apa yang paling penting dari studi kasus ini
                    untuk delivery berikutnya.
                  </p>
                </div>

                <p className="copy-muted text-base leading-8">{project.lessonsLearned}</p>
              </section>
            ) : null}

            {project.tutorial ? (
              <section className="surface-panel rounded-4xl p-6 md:p-8">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Tutorial dan implementasi lanjutan
                  </h2>
                  <p className="copy-muted text-sm">
                    Bagian ini menjembatani project showcase dengan jalur belajar atau penggunaan
                    yang lebih praktis.
                  </p>
                </div>

                <MarkdownContent content={project.tutorial} className="markdown-prose" />
              </section>
            ) : null}

            {relatedArticles.length > 0 ? (
              <section className="surface-panel content-mobile-only rounded-4xl p-5">
                <div className="content-section-heading">
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    Bacaan terkait
                  </h2>
                  <p className="copy-muted text-sm">
                    Jalur lanjutan untuk pembaca yang ingin masuk ke tutorial atau pembahasan yang
                    paling dekat dengan case study ini.
                  </p>
                </div>

                <div className="content-compact-list mt-5">
                  {relatedArticles.map((article) => (
                    <Link key={article.slug} href={article.href} className="content-compact-link">
                      <span className="content-compact-title">{article.title}</span>
                      <span className="content-compact-meta">{article.category}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedProjects.length > 0 ? (
              <section className="space-y-5">
                <div className="content-section-heading">
                  <h2 className="text-2xl font-semibold tracking-tight text-white">
                    Related projects
                  </h2>
                  <p className="copy-muted text-sm">
                    Project dipilih berdasarkan kategori yang sama, tumpang tindih stack, dan fokus
                    teknis yang paling mendekati studi kasus ini.
                  </p>
                </div>
                <div className="grid gap-5 xl:grid-cols-2">
                  {relatedProjects.map((relatedProject) => (
                    <ProjectCard
                      key={relatedProject.slug}
                      project={relatedProject}
                      variant="compact"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="content-sidebar-column content-desktop-only">
            <div className="content-sidebar-stack is-sticky">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Quick facts</h2>
                <dl className="content-definition-list">
                  <div>
                    <dt>Status</dt>
                    <dd>{project.status.label}</dd>
                  </div>
                  {project.roleLabel ? (
                    <div>
                      <dt>Peran</dt>
                      <dd>{project.roleLabel}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Kategori</dt>
                    <dd>
                      <Link href={`/projects/category/${project.categorySlug}`}>{project.category}</Link>
                    </dd>
                  </div>
                  <div>
                    <dt>Update terakhir</dt>
                    <dd>{project.updatedAtLabel}</dd>
                  </div>
                  <div>
                    <dt>Fokus</dt>
                    <dd>{project.technicalFocus[0] ?? "Case study"}</dd>
                  </div>
                </dl>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Stack & tools</h2>
                <div className="content-chip-row">
                  {project.stackDetailed.map((stack) => (
                    <Link
                      key={stack.slug}
                      href={`/projects?stack=${stack.slug}`}
                      className="tag-chip-subtle"
                    >
                      {stack.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Important links</h2>
                <div className="content-compact-list">
                  {project.demoUrl ? (
                    <Link href={project.demoUrl} className="content-compact-link">
                      <span className="content-compact-title">Live demo</span>
                      <span className="content-compact-meta">Versi publik project</span>
                    </Link>
                  ) : null}
                  {project.repoUrl ? (
                    <Link href={project.repoUrl} className="content-compact-link">
                      <span className="content-compact-title">Repository</span>
                      <span className="content-compact-meta">Kode sumber atau referensi implementasi</span>
                    </Link>
                  ) : null}
                  {project.tutorialUrl ? (
                    <Link href={project.tutorialUrl} className="content-compact-link">
                      <span className="content-compact-title">Tutorial terkait</span>
                      <span className="content-compact-meta">Panduan penggunaan atau implementasi</span>
                    </Link>
                  ) : null}
                </div>
              </section>

              <div className="content-desktop-only">
                <SupportContextCta context="project" layout="sidebar" />
              </div>

              {relatedArticles.length > 0 ? (
                <section className="content-sidebar-card">
                  <h2 className="content-sidebar-title">Bacaan terkait</h2>
                  <div className="content-compact-list">
                    {relatedArticles.map((article) => (
                      <Link key={article.slug} href={article.href} className="content-compact-link">
                        <span className="content-compact-title">{article.title}</span>
                        <span className="content-compact-meta">{article.category}</span>
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
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJson }} />
    </main>
  );
}

