import Link from "next/link";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { ProjectFormFields } from "@/components/admin/project-form-fields";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminProjects } from "@/lib/services/content";

type ProjectsAdminPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminProjectsPage({ searchParams }: ProjectsAdminPageProps) {
  const [query, projects] = await Promise.all([searchParams, getAdminProjects()]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Project list</h2>
            <p className="copy-muted mt-2 text-sm">
              CRUD project, slug SEO-friendly, thumbnail lokal, dan status publish/draft.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <StatusAlert status={query.status} error={query.error} />
        </div>

        <div className="mt-6 grid gap-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <article key={project.id} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="tag-chip-subtle">{project.category}</span>
                      <span className="tag-chip-subtle">{project.slug}</span>
                      <span className="tag-chip-subtle">
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                    <p className="copy-muted text-sm">{project.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/projects/${project.slug}`} className="button-secondary">
                      Public page
                    </Link>
                    <Link href={`/admin/projects/${project.id}`} className="button-secondary">
                      Edit
                    </Link>
                    <form action={`/api/projects/${project.id}`} method="post">
                      <CsrfTokenInput />
                      <input type="hidden" name="_method" value="DELETE" />
                      <button type="submit" className="button-secondary">
                        Hapus
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="copy-muted text-sm">
              Belum ada data project di database. Gunakan form di sisi kanan untuk menambah item pertama.
            </p>
          )}
        </div>
      </div>

      <section className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold text-white">Tambah project</h2>
        <form action="/api/projects" method="post" encType="multipart/form-data" className="mt-6">
          <CsrfTokenInput />
          <ProjectFormFields />

          <div className="mt-6">
            <button type="submit" className="button-primary">
              Simpan project
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
