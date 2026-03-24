import Image from "next/image";
import Link from "next/link";
import type { ProjectItem } from "@/lib/portfolio-data";
import { slugify } from "@/lib/slug";

type ProjectCardProps = {
  project: ProjectItem & {
    categorySlug?: string;
    status?: {
      label: string;
      tone: "success" | "accent" | "muted";
    };
    technicalFocus?: string[];
    stackDetailed?: Array<{ label: string; slug: string }>;
  };
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article id={project.slug} className="content-card content-card--project">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/8">
        <Image
          src={project.thumbnail}
          alt={project.thumbnailAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Link
            href={
              project.categorySlug
                ? `/projects/category/${project.categorySlug}`
                : `/projects/${project.slug}`
            }
            className="tag-chip"
          >
            {project.category}
          </Link>
          {project.status ? (
            <span className={`content-status-badge tone-${project.status.tone}`}>
              {project.status.label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <h3 className="content-card-title">
            <Link href={`/projects/${project.slug}`}>{project.name}</Link>
          </h3>
          <p className="content-card-summary">{project.summary}</p>
          <p className="copy-muted text-sm">{project.description}</p>
        </div>

        <div className="content-chip-row">
          {(project.stackDetailed ??
            project.techStack.map((item) => ({ label: item, slug: slugify(item) }))).map((item) => (
            <Link
              key={item.slug}
              href={`/projects?stack=${item.slug}`}
              className="tag-chip-subtle"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Fokus teknis
          </h4>
          <ul className="grid gap-2 text-sm text-slate-300">
            {(project.technicalFocus ?? project.features.slice(0, 3)).map((focus) => (
              <li key={focus} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span>{focus}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Feature highlights
          </h4>
          <ul className="grid gap-2 text-sm text-slate-300">
            {project.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Link href={`/projects/${project.slug}`} className="button-primary">
            Lihat case study
          </Link>

          {project.demoUrl ? (
            <Link href={project.demoUrl} className="button-secondary">
              Live demo
            </Link>
          ) : null}

          {project.repoUrl ? (
            <Link href={project.repoUrl} className="button-secondary">
              Repository
            </Link>
          ) : null}

          {project.tutorialUrl ? (
            <Link href={project.tutorialUrl} className="button-secondary">
              Tutorial
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
