import "dotenv/config";
import { rm } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { articles, type ArticleItem } from "@/lib/portfolio-data";

const REQUIRED_FLAGS = new Set(["--yes"]);
const KEEP_UPLOADS_FLAG = "--keep-uploads";
const TARGET_ARTICLE_SLUG = "membangun-portfolio-content-system-dengan-nextjs-app-router";

function getCliFlags() {
  return new Set(process.argv.slice(2));
}

function assertConfirmed(flags: Set<string>) {
  const confirmed = [...REQUIRED_FLAGS].every((flag) => flags.has(flag));

  if (confirmed) {
    return;
  }

  throw new Error(
    [
      "Perintah ini akan menghapus seluruh data aplikasi lalu menyisakan 1 admin + 1 artikel.",
      "",
      "Jalankan dengan konfirmasi eksplisit:",
      "bun run db:reset:clean -- --yes",
      "",
      "Opsional:",
      "bun run db:reset:clean -- --yes --keep-uploads",
    ].join("\n"),
  );
}

function getDatabaseClient() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL wajib diisi sebelum menjalankan reset clean.");
  }

  const adapter = new PrismaMariaDb(databaseUrl);
  return new PrismaClient({ adapter });
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi sebelum menjalankan reset clean.");
  }

  return { email, password };
}

type ResetSeedArticle = ArticleItem & {
  content: string;
  tags: string[];
};

function getTargetArticle(): ResetSeedArticle {
  const article = articles.find((item) => item.slug === TARGET_ARTICLE_SLUG);

  if (!article) {
    throw new Error(`Artikel target '${TARGET_ARTICLE_SLUG}' tidak ditemukan di lib/portfolio-data.ts`);
  }

  if (!article.content?.trim()) {
    throw new Error(`Artikel target '${TARGET_ARTICLE_SLUG}' tidak memiliki konten yang valid.`);
  }

  return {
    ...article,
    content: article.content,
    tags: article.tags ?? [],
  };
}

async function removeUploadsFolder() {
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
  await rm(uploadsDirectory, { recursive: true, force: true });
}

async function main() {
  const flags = getCliFlags();
  assertConfirmed(flags);

  const prisma = getDatabaseClient();
  const { email, password } = getAdminCredentials();
  const article = getTargetArticle();
  const keepUploads = flags.has(KEEP_UPLOADS_FLAG);
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany(),
      prisma.contactMessage.deleteMany(),
      prisma.supportTransaction.deleteMany(),
      prisma.project.deleteMany(),
      prisma.blogPost.deleteMany(),
      prisma.adminUser.deleteMany(),
    ]);

    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name: "Administrator",
      },
    });

    await prisma.blogPost.create({
      data: {
        title: article.title,
        slug: article.slug,
        category: article.category,
        summary: article.summary,
        content: article.content,
        tags: article.tags,
        coverImage: article.coverImage ?? null,
        published: true,
        publishedAt: article.publishedAtISO ? new Date(article.publishedAtISO) : new Date(),
      },
    });

    if (!keepUploads) {
      await removeUploadsFolder();
    }

    console.log(
      JSON.stringify(
        {
          status: "ok",
          adminEmail: email,
          articleSlug: article.slug,
          uploadsRemoved: !keepUploads,
          note: "Projects publik masih akan fallback ke seed content jika tabel project kosong.",
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
