import Image from "next/image";
import Link from "next/link";
import type { ProjectItem } from "@/lib/portfolio-data";

type ProjectCardProps = {
  project: ProjectItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article
      id={project.slug}
      className="surface-panel flex h-full flex-col overflow-hidden rounded-[2rem]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/8">
        <Image
          src={project.thumbnail}
          alt={project.thumbnailAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <span className="tag-chip absolute left-4 top-4">{project.category}</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight text-white">{project.name}</h3>
          <p className="text-sm font-medium text-slate-200">{project.summary}</p>
          <p className="copy-muted text-sm">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {project.techStack.map((item) => (
            <span key={item} className="tag-chip-subtle">
              {item}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Fitur utama
          </h4>
          <ul className="grid gap-2 text-sm text-slate-300">
            {project.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Link href={`/projects/${project.slug}`} className="button-primary">
            Detail project
          </Link>

          {project.demoUrl ? (
            <Link href={project.demoUrl} className="button-secondary">
              Live Demo
            </Link>
          ) : (
            <span className="tag-chip-subtle">Demo aktif pada fase admin</span>
          )}

          {project.repoUrl ? (
            <Link href={project.repoUrl} className="button-secondary">
              Repository
            </Link>
          ) : (
            <span className="tag-chip-subtle">Repo aktif pada fase admin</span>
          )}

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
