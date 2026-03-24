import Link from "next/link";
import { notFound } from "next/navigation";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { ProjectFormFields } from "@/components/admin/project-form-fields";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminProjectById } from "@/lib/services/content";

type ProjectEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminProjectEditPage({
  params,
  searchParams,
}: ProjectEditPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = await getAdminProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Edit project</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {project.name}
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Perubahan akan memperbarui slug bila perlu, lalu memicu revalidation halaman project
            publik pada request berikutnya.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/projects" className="admin-button-secondary">
            Kembali ke daftar
          </Link>
          {project.published ? (
            <Link href={`/projects/${project.slug}`} className="admin-button-ghost">
              Buka publik
            </Link>
          ) : null}
        </div>
      </header>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form
        action={`/api/projects/${project.id}`}
        method="post"
        encType="multipart/form-data"
        className="admin-page"
      >
        <CsrfTokenInput />
        <ProjectFormFields project={project} mode="edit" />
      </form>

      <section className="admin-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="admin-panel-label">Danger zone</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Hapus project</h2>
            <p className="admin-help mt-2 max-w-2xl">
              Gunakan aksi ini hanya jika project memang harus dihapus dari dashboard dan halaman
              publik.
            </p>
          </div>

          <form action={`/api/projects/${project.id}`} method="post">
            <CsrfTokenInput />
            <input type="hidden" name="_method" value="DELETE" />
            <button type="submit" className="admin-button-danger">
              Hapus project
            </button>
          </form>
        </div>
      </section>
    </section>
  );
}
