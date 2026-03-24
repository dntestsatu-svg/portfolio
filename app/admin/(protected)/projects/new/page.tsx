import Link from "next/link";
import { ProjectFormFields } from "@/components/admin/project-form-fields";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { StatusAlert } from "@/components/admin/status-alert";

type ProjectCreatePageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminProjectCreatePage({ searchParams }: ProjectCreatePageProps) {
  const query = await searchParams;

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">New project</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Tambah project baru
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Workspace ini dipakai untuk menyusun studi kasus project secara rapi: informasi inti,
            detail implementasi, stack, tautan, media, dan status publish.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/projects" className="admin-button-secondary">
            Kembali ke daftar
          </Link>
        </div>
      </header>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form action="/api/projects" method="post" encType="multipart/form-data" className="admin-page">
        <CsrfTokenInput />
        <ProjectFormFields mode="create" />
      </form>
    </section>
  );
}
