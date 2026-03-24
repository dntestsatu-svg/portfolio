import type { ProjectItem } from "@/lib/portfolio-data";
import { getLatestArticles, searchBlogArticles } from "@/lib/services/blog";
import {
  buildRelativeScore,
  paginate,
  sortByLatest,
  sortByUpdated,
  type PaginationResult,
  type TaxonomyCount,
  uniqueTaxonomy,
} from "@/lib/services/discovery-utils";
import { slugify } from "@/lib/slug";
import { getPublicProjects } from "@/lib/services/content";

export type ProjectStack = {
  label: string;
  slug: string;
};

export type ProjectStatus = {
  label: "Production" | "Case Study" | "Private" | "Demo";
  tone: "success" | "accent" | "muted";
};

export type ProjectCaseStudy = ProjectItem & {
  categorySlug: string;
  href: string;
  publishedAtISO: string;
  updatedAtISO: string;
  updatedAtLabel: string;
  stackDetailed: ProjectStack[];
  status: ProjectStatus;
  technicalFocus: string[];
};

export type ProjectSortOption = "featured" | "latest" | "updated";

export type ProjectCollection = {
  items: ProjectCaseStudy[];
  pagination: PaginationResult;
  featuredProjects: ProjectCaseStudy[];
  categories: TaxonomyCount[];
  stacks: TaxonomyCount[];
};

function enrichProject(project: ProjectItem, index: number): ProjectCaseStudy {
  const publishedAtISO =
    project.publishedAt ??
    project.updatedAt ??
    new Date(Date.UTC(2026, 2, 24 - index)).toISOString();
  const updatedAtISO = project.updatedAt ?? publishedAtISO;
  const hasDemo = Boolean(project.demoUrl);
  const hasRepository = Boolean(project.repoUrl);

  let status: ProjectStatus = {
    label: "Case Study",
    tone: "accent",
  };

  if (hasDemo && hasRepository) {
    status = {
      label: "Production",
      tone: "success",
    };
  } else if (hasDemo) {
    status = {
      label: "Demo",
      tone: "accent",
    };
  } else if (!hasDemo && !hasRepository) {
    status = {
      label: "Private",
      tone: "muted",
    };
  }

  return {
    ...project,
    href: `/projects/${project.slug}`,
    categorySlug: slugify(project.category),
    publishedAtISO,
    updatedAtISO,
    updatedAtLabel: project.updatedAtLabel ?? new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(updatedAtISO)),
    stackDetailed: project.techStack.map((stack) => ({
      label: stack,
      slug: slugify(stack),
    })),
    status,
    technicalFocus: project.focusAreas ?? project.features.slice(0, 3),
  };
}

async function getAllProjects() {
  const projects = await getPublicProjects();
  return projects.map(enrichProject);
}

function getProjectTaxonomy(projects: ProjectCaseStudy[]) {
  return {
    categories: uniqueTaxonomy(projects.map((project) => project.category)),
    stacks: uniqueTaxonomy(projects.flatMap((project) => project.stackDetailed.map((item) => item.label))),
  };
}

function sortProjects(projects: ProjectCaseStudy[], sort: ProjectSortOption) {
  switch (sort) {
    case "updated":
      return sortByUpdated(projects);
    case "latest":
      return sortByLatest(projects);
    case "featured":
    default:
      return [...sortByLatest(projects)].sort((left, right) => {
        if (right.featured !== left.featured) {
          return Number(right.featured) - Number(left.featured);
        }

        return new Date(right.updatedAtISO).getTime() - new Date(left.updatedAtISO).getTime();
      });
  }
}

export async function getProjectsArchive(options?: {
  page?: number;
  pageSize?: number;
  sort?: ProjectSortOption;
  stack?: string;
}) {
  const projects = await getAllProjects();
  const { categories, stacks } = getProjectTaxonomy(projects);
  const activeStack = options?.stack?.trim();
  const filtered = activeStack
    ? projects.filter((project) => project.stackDetailed.some((item) => item.slug === activeStack))
    : projects;
  const featuredProjects = sortProjects(
    projects.filter((project) => project.featured),
    "featured",
  ).slice(0, 3);
  const collection = !activeStack
    ? filtered.filter((project) => !featuredProjects.some((featured) => featured.slug === project.slug))
    : filtered;
  const sorted = sortProjects(collection, options?.sort ?? "featured");
  const { items, pagination } = paginate(sorted, options?.page ?? 1, options?.pageSize ?? 6);

  return {
    items,
    pagination,
    featuredProjects,
    categories,
    stacks,
    activeStack,
  } satisfies ProjectCollection & {
    activeStack?: string;
  };
}

export async function getProjectBySlug(slug: string) {
  const projects = await getAllProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getProjectCategoryPage(
  slug: string,
  options?: { page?: number; pageSize?: number; sort?: ProjectSortOption },
) {
  const projects = await getAllProjects();
  const { categories, stacks } = getProjectTaxonomy(projects);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  const filtered = projects.filter((project) => project.categorySlug === slug);
  const sorted = sortProjects(filtered, options?.sort ?? "featured");
  const { items, pagination } = paginate(sorted, options?.page ?? 1, options?.pageSize ?? 6);

  return {
    taxonomy: category,
    description: `${category.count} project di kategori ${category.label} yang menonjolkan studi kasus implementasi, keputusan teknis, dan fokus delivery yang berbeda-beda.`,
    items,
    pagination,
    categories,
    stacks,
    featuredProjects: projects.filter((project) => project.featured).slice(0, 3),
  };
}

export async function searchProjects(options: {
  query: string;
  page?: number;
  pageSize?: number;
}) {
  const projects = await getAllProjects();
  const { categories, stacks } = getProjectTaxonomy(projects);
  const query = options.query.trim();

  if (!query) {
    return {
      query,
      items: [] as ProjectCaseStudy[],
      pagination: paginate<ProjectCaseStudy>([], options.page ?? 1, options.pageSize ?? 6).pagination,
      categories,
      stacks,
      featuredProjects: projects.filter((project) => project.featured).slice(0, 3),
    };
  }

  const ranked = [...projects]
    .map((project) => ({
      project,
      score: buildRelativeScore(
        [
          { value: project.name, weight: 8 },
          { value: project.summary, weight: 5 },
          { value: project.description, weight: 4 },
          { value: project.body ?? "", weight: 2 },
          { value: project.category, weight: 4 },
          { value: project.stackDetailed.map((item) => item.label).join(" "), weight: 4 },
          { value: project.features.join(" "), weight: 3 },
        ],
        query,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(right.project.updatedAtISO).getTime() - new Date(left.project.updatedAtISO).getTime();
    })
    .map((item) => item.project);

  const { items, pagination } = paginate(ranked, options.page ?? 1, options.pageSize ?? 6);

  return {
    query,
    items,
    pagination,
    categories,
    stacks,
    featuredProjects: projects.filter((project) => project.featured).slice(0, 3),
  };
}

export async function getRelatedProjects(slug: string, limit = 4) {
  const projects = await getAllProjects();
  const current = projects.find((project) => project.slug === slug);

  if (!current) {
    return [];
  }

  const currentStacks = new Set(current.stackDetailed.map((item) => item.slug));
  const ranked = projects
    .filter((project) => project.slug !== slug)
    .map((project) => {
      let score = 0;

      if (project.categorySlug === current.categorySlug) {
        score += 30;
      }

      for (const stack of project.stackDetailed) {
        if (currentStacks.has(stack.slug)) {
          score += 12;
        }
      }

      score += buildRelativeScore(
        [
          { value: project.summary, weight: 3 },
          { value: project.description, weight: 2 },
          { value: project.features.join(" "), weight: 2 },
        ],
        `${current.name} ${current.category} ${current.stackDetailed.map((item) => item.label).join(" ")}`,
      );

      return {
        project,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(right.project.updatedAtISO).getTime() - new Date(left.project.updatedAtISO).getTime();
    })
    .map((item) => item.project);

  return ranked.slice(0, limit);
}

export async function getRelatedProjectArticles(slug: string, limit = 3) {
  const project = await getProjectBySlug(slug);

  if (!project) {
    return [];
  }

  const query = [
    project.name,
    project.category,
    ...project.stackDetailed.map((item) => item.label),
    ...project.features,
  ].join(" ");
  const searchResults = await searchBlogArticles({
    query,
    page: 1,
    pageSize: limit,
  });

  if (searchResults.items.length > 0) {
    return searchResults.items.slice(0, limit);
  }

  return getLatestArticles(limit);
}

export async function getProjectTaxonomies() {
  const projects = await getAllProjects();
  return getProjectTaxonomy(projects);
}

export async function getProjectSlugs() {
  const projects = await getAllProjects();
  return projects.map((project) => project.slug);
}
