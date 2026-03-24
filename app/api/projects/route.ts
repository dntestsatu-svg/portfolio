import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { buildPublicUrl, formDataToObject, isFormRequest } from "@/lib/request";
import { revalidatePortfolioContent } from "@/lib/revalidate";
import { slugify } from "@/lib/slug";
import { createProject, getAdminProjects, getPublicProjects } from "@/lib/services/content";
import { assertAdminMutationRequest } from "@/lib/security/csrf";
import { SecurityError } from "@/lib/security/security-error";
import { recordAdminContentAuditLogSafely } from "@/lib/services/audit-log";
import { projectInputSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");

  if (scope === "admin") {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await getAdminProjects(), {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }

  return NextResponse.json(await getPublicProjects(), {
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

    const input = projectInputSchema.parse(
      formData ? formDataToObject(formData) : await request.json(),
    );
    const thumbnail = formData?.get("thumbnail");
    const project = await createProject(input, thumbnail instanceof File ? thumbnail : null);

    revalidatePortfolioContent({
      slug: project.slug,
      categorySlugs: [slugify(project.category)],
      type: "project",
    });
    await recordAdminContentAuditLogSafely({
      action: "create",
      entityType: "project",
      request,
      session,
      entityId: project.id,
      entityLabel: project.name,
      previousPublished: false,
      nextPublished: project.published,
      metadata: {
        slug: project.slug,
        featured: project.featured,
      },
    });

    if (formSubmission) {
      return NextResponse.redirect(
        buildPublicUrl(request, `/admin/projects/${project.id}?status=created`),
        {
          status: 303,
        },
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (formSubmission) {
      return NextResponse.redirect(
        buildPublicUrl(
          request,
          `/admin/projects/new?error=${encodeURIComponent(
            error instanceof Error ? error.message : "Gagal membuat project.",
          )}`,
        ),
        { status: 303 },
      );
    }

    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat project." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
