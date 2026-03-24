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
  variant?: "default" | "compact";
};

export function ProjectCard({ project, variant = "default" }: ProjectCardProps) {
  const isCompact = variant === "compact";
  const stackItems =
    project.stackDetailed ??
    project.techStack.map((item) => ({ label: item, slug: slugify(item) }));
  const visibleStacks = isCompact ? stackItems.slice(0, 4) : stackItems;
  const hiddenStackCount = Math.max(stackItems.length - visibleStacks.length, 0);
  const focusItems = (project.technicalFocus ?? project.features.slice(0, 3)).slice(
    0,
    isCompact ? 2 : 3,
  );
  const supportingLinks = [
    project.demoUrl ? { href: project.demoUrl, label: "Live demo" } : null,
    project.repoUrl ? { href: project.repoUrl, label: "Repository" } : null,
    project.tutorialUrl ? { href: project.tutorialUrl, label: "Tutorial" } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <article
      id={project.slug}
      className={`content-card content-card--project${
        isCompact ? " content-card--project-compact" : ""
      }`}
    >
      <div className="relative aspect-16/10 overflow-hidden border-b border-white/8">
        <Image
          src={project.thumbnail}
          alt={project.thumbnailAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Link
            href={
              project.categorySlug
                ? `/projects/category/${project.categorySlug}`
                : `/projects/${project.slug}`
            }
            prefetch={false}
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

      <div
        className={`flex flex-1 flex-col ${
          isCompact ? "gap-3 p-4 sm:gap-4 sm:p-5" : "gap-5 p-6"
        }`}
      >
        <div className={isCompact ? "space-y-2.5" : "space-y-3"}>
          <h3 className="content-card-title">
            <Link href={`/projects/${project.slug}`} prefetch={false}>
              {project.name}
            </Link>
          </h3>
          <p className="content-card-summary">{project.summary}</p>
          {!isCompact ? <p className="copy-muted text-sm">{project.description}</p> : null}
        </div>

        <div className="content-chip-row">
          {visibleStacks.map((item) => (
            <Link
              key={item.slug}
              href={`/projects?stack=${item.slug}`}
              prefetch={false}
              className="tag-chip-subtle"
            >
              {item.label}
            </Link>
          ))}
          {hiddenStackCount > 0 ? (
            <span className="tag-chip-subtle" aria-label={`${hiddenStackCount} stack tambahan`}>
              +{hiddenStackCount}
            </span>
          ) : null}
        </div>

        <div className={isCompact ? "space-y-2" : "space-y-2"}>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            {isCompact ? "Fokus utama" : "Fokus teknis"}
          </h4>
          <ul className={isCompact ? "content-card-focus-list" : "grid gap-2 text-sm text-slate-300"}>
            {focusItems.map((focus) => (
              <li key={focus} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-(--color-accent)" />
                <span>{focus}</span>
              </li>
            ))}
          </ul>
        </div>

        {!isCompact ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
              Feature highlights
            </h4>
            <ul className="grid gap-2 text-sm text-slate-300">
              {project.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-(--color-accent)" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className={`mt-auto flex flex-wrap ${isCompact ? "items-center gap-2.5 pt-1" : "gap-3 pt-2"}`}>
          <Link href={`/projects/${project.slug}`} prefetch={false} className="button-primary">
            Lihat case study
          </Link>

          {isCompact ? (
            supportingLinks.length > 0 ? (
              <div className="content-card-link-row">
                {supportingLinks.map((item) => (
                  <Link key={`${project.slug}-${item.label}`} href={item.href} prefetch={false}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </article>
  );
}

