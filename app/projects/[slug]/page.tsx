import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublicProjectBySlug, getPublicProjects } from "@/lib/services/content";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

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
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      url: `/projects/${project.slug}`,
      title: `${project.name} | Rodex Castello`,
      description: project.summary,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
    twitter: {
      title: `${project.name} | Rodex Castello`,
      description: project.summary,
      images: project.thumbnail ? [project.thumbnail] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-8">
        <div className="flex flex-wrap gap-3">
          <span className="tag-chip">{project.category}</span>
          <span className="tag-chip-subtle">{project.slug}</span>
        </div>

        <section className="surface-panel rounded-[2rem] p-8">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            {project.name}
          </h1>
          <p className="mt-5 max-w-4xl text-xl leading-9 text-slate-200">{project.summary}</p>
          <p className="copy-muted mt-5 max-w-4xl text-base">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/projects" className="button-secondary">
              Kembali ke archive
            </Link>
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
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
          <article className="surface-panel rounded-[2rem] p-8">
            <h2 className="text-2xl font-semibold text-white">Detail implementasi</h2>
            <div className="markdown-prose mt-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.body ?? project.description}
              </ReactMarkdown>
            </div>

            {project.tutorial ? (
              <>
                <h2 className="mt-10 text-2xl font-semibold text-white">Tutorial penggunaan</h2>
                <div className="markdown-prose mt-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.tutorial}
                  </ReactMarkdown>
                </div>
              </>
            ) : null}
          </article>

          <aside className="surface-panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">Stack & fitur</h2>

            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Tech stack
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.techStack.map((item) => (
                  <span key={item} className="tag-chip-subtle">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Fitur utama
              </h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-200">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
