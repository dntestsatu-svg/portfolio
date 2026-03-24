import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { buildPublicUrl, formDataToObject } from "@/lib/request";
import { revalidatePortfolioContent } from "@/lib/revalidate";
import { assertAdminMutationRequest } from "@/lib/security/csrf";
import { SecurityError } from "@/lib/security/security-error";
import { slugify } from "@/lib/slug";
import { recordAdminContentAuditLogSafely } from "@/lib/services/audit-log";
import { deleteProject, getAdminProjectById, updateProject } from "@/lib/services/content";
import { projectInputSchema } from "@/lib/validators";

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
  const project = await getAdminProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "Project tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(project);
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
      buildPublicUrl(
        request,
        `/admin/projects?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Request tidak valid.",
        )}`,
      ),
      { status: 303 },
    );
  }

  if (method === "DELETE") {
    try {
      assertAdminMutationRequest(request, { formData, requireToken: true });
      const current = await getAdminProjectById(id);
      const slug = await deleteProject(id);
      revalidatePortfolioContent({
        slug: slug ?? undefined,
        categorySlugs: current ? [slugify(current.category)] : [],
        type: "project",
      });
      if (current) {
        await recordAdminContentAuditLogSafely({
          action: "delete",
          entityType: "project",
          request,
          session,
          entityId: current.id,
          entityLabel: current.name,
          metadata: {
            slug: current.slug,
            published: current.published,
          },
        });
      }
      return NextResponse.redirect(buildPublicUrl(request, "/admin/projects?status=deleted"), {
        status: 303,
      });
    } catch (error) {
      return NextResponse.redirect(
        buildPublicUrl(
          request,
          `/admin/projects?error=${encodeURIComponent(
            error instanceof Error ? error.message : "Gagal menghapus project.",
          )}`,
        ),
        { status: 303 },
      );
    }
  }

  try {
    assertAdminMutationRequest(request, { formData, requireToken: true });
    const current = await getAdminProjectById(id);
    const input = projectInputSchema.parse(formDataToObject(formData));
    const thumbnail = formData.get("thumbnail");
    const project = await updateProject(id, input, thumbnail instanceof File ? thumbnail : null);
    revalidatePortfolioContent({
      slug: project.slug,
      categorySlugs: [
        slugify(project.category),
        current?.category ? slugify(current.category) : "",
      ],
      previousSlug: current?.slug ?? null,
      type: "project",
    });
    await recordAdminContentAuditLogSafely({
      action: "update",
      entityType: "project",
      request,
      session,
      entityId: project.id,
      entityLabel: project.name,
      previousPublished: current?.published ?? false,
      nextPublished: project.published,
      metadata: {
        slug: project.slug,
        previousSlug: current?.slug ?? null,
        featured: project.featured,
      },
    });
    return NextResponse.redirect(buildPublicUrl(request, `/admin/projects/${id}?status=saved`), {
      status: 303,
    });
  } catch (error) {
    return NextResponse.redirect(
      buildPublicUrl(
        request,
        `/admin/projects/${id}?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Gagal memperbarui project.",
        )}`,
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
    const current = await getAdminProjectById(id);
    const input = projectInputSchema.parse(await request.json());
    const project = await updateProject(id, input);
    revalidatePortfolioContent({
      slug: project.slug,
      categorySlugs: [
        slugify(project.category),
        current?.category ? slugify(current.category) : "",
      ],
      previousSlug: current?.slug ?? null,
      type: "project",
    });
    await recordAdminContentAuditLogSafely({
      action: "update",
      entityType: "project",
      request,
      session,
      entityId: project.id,
      entityLabel: project.name,
      previousPublished: current?.published ?? false,
      nextPublished: project.published,
      metadata: {
        slug: project.slug,
        previousSlug: current?.slug ?? null,
        featured: project.featured,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    const status = error instanceof SecurityError ? error.status : 400;
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui project." },
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
    const current = await getAdminProjectById(id);
    const slug = await deleteProject(id);
    revalidatePortfolioContent({
      slug: slug ?? undefined,
      categorySlugs: current ? [slugify(current.category)] : [],
      type: "project",
    });
    if (current) {
      await recordAdminContentAuditLogSafely({
        action: "delete",
        entityType: "project",
        request,
        session,
        entityId: current.id,
        entityLabel: current.name,
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
      { error: error instanceof Error ? error.message : "Gagal menghapus project." },
      { status },
    );

    if (error instanceof SecurityError && error.retryAfter) {
      response.headers.set("Retry-After", String(error.retryAfter));
    }

    return response;
  }
}
