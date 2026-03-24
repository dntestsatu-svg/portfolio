import type { BlogPost, ContactMessage, Project } from "@prisma/client";
import { getDb } from "@/lib/db";
import { articles as seedArticles, projects as seedProjects, type ArticleItem, type ProjectItem } from "@/lib/portfolio-data";
import { slugify } from "@/lib/slug";
import { removeLocalUpload, saveImageUpload } from "@/lib/uploads";
import type { BlogInput, ContactInput, ProjectInput } from "@/lib/validators";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item : String(item)))
    .filter(Boolean);
}

function mapProject(record: Project): ProjectItem {
  return {
    id: record.id,
    slug: record.slug,
    name: record.title,
    category: record.category,
    summary: record.summary,
    description: record.description,
    body: record.body,
    tutorial: record.tutorial ?? undefined,
    thumbnail: record.thumbnailPath ?? "/projects/operational-dashboard.svg",
    thumbnailAlt: `Thumbnail ${record.title}`,
    techStack: normalizeStringArray(record.techStack),
    features: normalizeStringArray(record.features),
    featured: record.featured,
    published: record.published,
    publishedAt: record.publishedAt?.toISOString(),
    publishedAtLabel: record.publishedAt ? formatDate(record.publishedAt) : undefined,
    updatedAt: record.updatedAt.toISOString(),
    updatedAtLabel: formatDate(record.updatedAt),
    demoUrl: record.demoUrl ?? undefined,
    repoUrl: record.repoUrl ?? undefined,
    tutorialUrl: record.tutorial ? `/projects/${record.slug}` : undefined,
  };
}

function mapArticle(record: BlogPost): ArticleItem {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    category: record.category,
    publishedAt: formatDate(record.publishedAt ?? record.updatedAt),
    publishedAtISO: (record.publishedAt ?? record.updatedAt).toISOString(),
    updatedAtISO: record.updatedAt.toISOString(),
    updatedAtLabel: formatDate(record.updatedAt),
    content: record.content,
    tags: normalizeStringArray(record.tags),
    coverImage: record.coverImage,
    published: record.published,
    href: `/blog/${record.slug}`,
  };
}

async function getUniqueSlug(
  type: "project" | "blog",
  requestedSlug: string,
  excludeId?: string,
) {
  const db = getDb();
  const base = slugify(requestedSlug) || `${type}-${Date.now()}`;

  if (!db) {
    return base;
  }

  let counter = 0;
  let candidate = base;

  while (true) {
    const existing =
      type === "project"
        ? await db.project.findUnique({ where: { slug: candidate } })
        : await db.blogPost.findUnique({ where: { slug: candidate } });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function getPublicProjects() {
  const db = getDb();

  if (!db) {
    return seedProjects.filter((item) => item.published !== false);
  }

  try {
    const projects = await db.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
    });

    if (projects.length === 0) {
      return seedProjects.filter((item) => item.published !== false);
    }

    return projects.map(mapProject);
  } catch {
    return seedProjects.filter((item) => item.published !== false);
  }
}

export async function getPublicProjectBySlug(slug: string) {
  const db = getDb();

  if (!db) {
    return seedProjects.find((item) => item.slug === slug && item.published !== false) ?? null;
  }

  try {
    const project = await db.project.findUnique({
      where: { slug },
    });

    if (!project || !project.published) {
      return null;
    }

    return mapProject(project);
  } catch {
    return seedProjects.find((item) => item.slug === slug && item.published !== false) ?? null;
  }
}

export async function getPublicArticles() {
  const db = getDb();

  if (!db) {
    return seedArticles.filter((item) => item.published !== false);
  }

  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    });

    if (posts.length === 0) {
      return seedArticles.filter((item) => item.published !== false);
    }

    return posts.map(mapArticle);
  } catch {
    return seedArticles.filter((item) => item.published !== false);
  }
}

export async function getPublicArticleBySlug(slug: string) {
  const db = getDb();

  if (!db) {
    return seedArticles.find((item) => item.slug === slug && item.published !== false) ?? null;
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return null;
    }

    return mapArticle(post);
  } catch {
    return seedArticles.find((item) => item.slug === slug && item.published !== false) ?? null;
  }
}

export async function getAdminProjects() {
  const db = getDb();

  if (!db) {
    return [];
  }

  const projects = await db.project.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return projects.map(mapProject);
}

export async function getAdminProjectById(id: string) {
  const db = getDb();

  if (!db) {
    return null;
  }

  const project = await db.project.findUnique({ where: { id } });
  return project ? mapProject(project) : null;
}

export async function createProject(input: ProjectInput, thumbnailFile?: File | null) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const slug = await getUniqueSlug("project", input.slug || input.title);
  const thumbnailPath = thumbnailFile ? await saveImageUpload(thumbnailFile, "projects") : null;

  const project = await db.project.create({
    data: {
      title: input.title,
      slug,
      category: input.category,
      summary: input.summary,
      description: input.description,
      body: input.body,
      tutorial: input.tutorial || null,
      thumbnailPath,
      demoUrl: input.demoUrl,
      repoUrl: input.repoUrl,
      techStack: input.techStack,
      features: input.features,
      published: input.published,
      featured: input.featured,
      publishedAt: input.published ? new Date() : null,
    },
  });

  return mapProject(project);
}

export async function updateProject(id: string, input: ProjectInput, thumbnailFile?: File | null) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const current = await db.project.findUnique({ where: { id } });

  if (!current) {
    throw new Error("Project tidak ditemukan.");
  }

  const slug = await getUniqueSlug("project", input.slug || input.title, id);
  let thumbnailPath = current.thumbnailPath;

  if (thumbnailFile && thumbnailFile.size > 0) {
    thumbnailPath = await saveImageUpload(thumbnailFile, "projects");
  }

  const project = await db.project.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      category: input.category,
      summary: input.summary,
      description: input.description,
      body: input.body,
      tutorial: input.tutorial || null,
      thumbnailPath,
      demoUrl: input.demoUrl,
      repoUrl: input.repoUrl,
      techStack: input.techStack,
      features: input.features,
      published: input.published,
      featured: input.featured,
      publishedAt: input.published ? current.publishedAt ?? new Date() : null,
    },
  });

  if (thumbnailPath && thumbnailPath !== current.thumbnailPath) {
    await removeLocalUpload(current.thumbnailPath);
  }

  return mapProject(project);
}

export async function deleteProject(id: string) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const current = await db.project.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  await db.project.delete({ where: { id } });
  await removeLocalUpload(current.thumbnailPath);

  return current.slug;
}

export async function getAdminArticles() {
  const db = getDb();

  if (!db) {
    return [];
  }

  const posts = await db.blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return posts.map(mapArticle);
}

export async function getAdminArticleById(id: string) {
  const db = getDb();

  if (!db) {
    return null;
  }

  const post = await db.blogPost.findUnique({ where: { id } });
  return post ? mapArticle(post) : null;
}

export async function createArticle(input: BlogInput, coverImage?: File | null) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const slug = await getUniqueSlug("blog", input.slug || input.title);
  const coverImagePath = coverImage ? await saveImageUpload(coverImage, "blog") : null;

  const post = await db.blogPost.create({
    data: {
      title: input.title,
      slug,
      category: input.category,
      summary: input.summary,
      content: input.content,
      tags: input.tags,
      coverImage: coverImagePath,
      published: input.published,
      publishedAt: input.published ? new Date() : null,
    },
  });

  return mapArticle(post);
}

export async function updateArticle(id: string, input: BlogInput, coverImage?: File | null) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const current = await db.blogPost.findUnique({ where: { id } });

  if (!current) {
    throw new Error("Artikel tidak ditemukan.");
  }

  const slug = await getUniqueSlug("blog", input.slug || input.title, id);
  let coverImagePath = current.coverImage;

  if (coverImage && coverImage.size > 0) {
    coverImagePath = await saveImageUpload(coverImage, "blog");
  }

  const post = await db.blogPost.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      category: input.category,
      summary: input.summary,
      content: input.content,
      tags: input.tags,
      coverImage: coverImagePath,
      published: input.published,
      publishedAt: input.published ? current.publishedAt ?? new Date() : null,
    },
  });

  if (coverImagePath && coverImagePath !== current.coverImage) {
    await removeLocalUpload(current.coverImage);
  }

  return mapArticle(post);
}

export async function deleteArticle(id: string) {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const current = await db.blogPost.findUnique({ where: { id } });

  if (!current) {
    return null;
  }

  await db.blogPost.delete({ where: { id } });
  await removeLocalUpload(current.coverImage);

  return current.slug;
}

export async function createContactMessage(input: ContactInput) {
  const db = getDb();
  const contactData = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  };

  if (!db) {
    return {
      id: "local-preview",
      ...contactData,
      status: "queued",
    };
  }

  return db.contactMessage.create({
    data: contactData,
  });
}

export async function getContactMessages() {
  const db = getDb();

  if (!db) {
    return [] as ContactMessage[];
  }

  return db.contactMessage.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function markContactMessageStatus(id: string, status: "read" | "unread") {
  const db = getDb();

  if (!db) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  return db.contactMessage.update({
    where: { id },
    data: { status },
  });
}

export async function getDashboardSummary() {
  const db = getDb();

  if (!db) {
    return {
      projectCount: 0,
      articleCount: 0,
      unreadContactCount: 0,
      databaseReady: false,
    };
  }

  const [projectCount, articleCount, unreadContactCount] = await Promise.all([
    db.project.count(),
    db.blogPost.count(),
    db.contactMessage.count({ where: { status: "unread" } }),
  ]);

  return {
    projectCount,
    articleCount,
    unreadContactCount,
    databaseReady: true,
  };
}
