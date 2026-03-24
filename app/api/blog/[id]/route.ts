import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { formDataToObject } from "@/lib/request";
import { revalidatePortfolioContent } from "@/lib/revalidate";
import { assertAdminMutationRequest } from "@/lib/security/csrf";
import { SecurityError } from "@/lib/security/security-error";
import { recordAdminContentAuditLogSafely } from "@/lib/services/audit-log";
import { deleteArticle, getAdminArticleById, updateArticle } from "@/lib/services/content";
import { blogInputSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await getAdminArticleById(id);

  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let formData: FormData;
  let method: string;

  try {
    assertAdminMutationRequest(request);
    formData = await request.formData();
    method = String(formData.get("_method") ?? "POST").toUpperCase();
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/blog?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Request tidak valid.",
        )}`,
        request.url,
      ),
      { status: 303 },
    );
  }

  if (method === "DELETE") {
    try {
      assertAdminMutationRequest(request, { formData, requireToken: true });
      const current = await getAdminArticleById(id);
      const slug = await deleteArticle(id);
      revalidatePortfolioContent({
        slug: slug ?? undefined,
        type: "blog",
      });
      if (current) {
        await recordAdminContentAuditLogSafely({
          action: "delete",
          entityType: "blog",
          request,
          session,
          entityId: current.id,
          entityLabel: current.title,
          metadata: {
            slug: current.slug,
            published: current.published,
          },
        });
      }
      return NextResponse.redirect(new URL("/admin/blog?status=deleted", request.url), {
        status: 303,
      });
    } catch (error) {
      return NextResponse.redirect(
        new URL(
          `/admin/blog?error=${encodeURIComponent(
            error instanceof Error ? error.message : "Gagal menghapus artikel.",
          )}`,
          request.url,
        ),
        { status: 303 },
      );
    }
  }

  try {
    assertAdminMutationRequest(request, { formData, requireToken: true });
    const current = await getAdminArticleById(id);
    const input = blogInputSchema.parse(formDataToObject(formData));
    const coverImage = formData.get("coverImage");
    const article = await updateArticle(id, input, coverImage instanceof File ? coverImage : null);
    revalidatePortfolioContent({
      slug: article.slug,
      previousSlug: current?.slug ?? null,
      type: "blog",
    });
    await recordAdminContentAuditLogSafely({
      action: "update",
      entityType: "blog",
      request,
      session,
      entityId: article.id,
      entityLabel: article.title,
      previousPublished: current?.published ?? false,
      nextPublished: article.published,
      metadata: {
        slug: article.slug,
        previousSlug: current?.slug ?? null,
      },
    });
    return NextResponse.redirect(new URL(`/admin/blog/${id}?status=saved`, request.url), {
      status: 303,
    });
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/blog/${id}?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Gagal memperbarui artikel.",
        )}`,
        request.url,
      ),
      { status: 303 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    assertAdminMutationRequest(request, { requireToken: true });
    const current = await getAdminArticleById(id);
    const input = blogInputSchema.parse(await request.json());
    const article = await updateArticle(id, input);
    revalidatePortfolioContent({
      slug: article.slug,
      previousSlug: current?.slug ?? null,
      type: "blog",
    });
    await recordAdminContentAuditLogSafely({
      action: "update",
      entityType: "blog",
      request,
      session,
      entityId: article.id,
      entityLabel: article.title,
      previousPublished: current?.published ?? false,
      nextPublished: article.published,
      metadata: {
        slug: article.slug,
        previousSlug: current?.slug ?? null,
      },
    });
    return NextResponse.json(article);
  } catch (error) {
    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui artikel." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    assertAdminMutationRequest(request, { requireToken: true });
    const current = await getAdminArticleById(id);
    const slug = await deleteArticle(id);
    revalidatePortfolioContent({
      slug: slug ?? undefined,
      type: "blog",
    });
    if (current) {
      await recordAdminContentAuditLogSafely({
        action: "delete",
        entityType: "blog",
        request,
        session,
        entityId: current.id,
        entityLabel: current.title,
        metadata: {
          slug: current.slug,
          published: current.published,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus artikel." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
