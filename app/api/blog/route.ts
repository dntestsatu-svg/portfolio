import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { buildPublicUrl, formDataToObject, isFormRequest } from "@/lib/request";
import { revalidatePortfolioContent } from "@/lib/revalidate";
import { slugify } from "@/lib/slug";
import { createArticle, getAdminArticles, getPublicArticles } from "@/lib/services/content";
import { assertAdminMutationRequest } from "@/lib/security/csrf";
import { SecurityError } from "@/lib/security/security-error";
import { recordAdminContentAuditLogSafely } from "@/lib/services/audit-log";
import { blogInputSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");

  if (scope === "admin") {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await getAdminArticles(), {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }

  return NextResponse.json(await getPublicArticles(), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formSubmission = isFormRequest(request);
  let formData: FormData | null = null;

  try {
    if (formSubmission) {
      assertAdminMutationRequest(request);
      formData = await request.formData();
    }

    assertAdminMutationRequest(request, {
      formData,
      requireToken: true,
    });

    const input = blogInputSchema.parse(
      formData ? formDataToObject(formData) : await request.json(),
    );
    const coverImage = formData?.get("coverImage");
    const article = await createArticle(input, coverImage instanceof File ? coverImage : null);

    revalidatePortfolioContent({
      slug: article.slug,
      categorySlugs: [slugify(article.category)],
      tagSlugs: (article.tags ?? []).map(slugify),
      type: "blog",
    });
    await recordAdminContentAuditLogSafely({
      action: "create",
      entityType: "blog",
      request,
      session,
      entityId: article.id,
      entityLabel: article.title,
      previousPublished: false,
      nextPublished: article.published,
      metadata: {
        slug: article.slug,
      },
    });

    if (formSubmission) {
      return NextResponse.redirect(
        buildPublicUrl(request, `/admin/blog/${article.id}?status=created`),
        {
          status: 303,
        },
      );
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (formSubmission) {
      return NextResponse.redirect(
        buildPublicUrl(
          request,
          `/admin/blog/new?error=${encodeURIComponent(
            error instanceof Error ? error.message : "Gagal membuat artikel.",
          )}`,
        ),
        { status: 303 },
      );
    }

    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat artikel." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
