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
    <section className="surface-panel rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-white">Edit project</h2>
      <p className="copy-muted mt-2 text-sm">
        Perubahan akan memperbarui halaman slug project dan memicu revalidation konten publik.
      </p>

      <div className="mt-6">
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form
        action={`/api/projects/${project.id}`}
        method="post"
        encType="multipart/form-data"
        className="mt-6"
      >
        <CsrfTokenInput />
        <ProjectFormFields project={project} />

        <div className="mt-6">
          <button type="submit" className="button-primary">
            Simpan perubahan
          </button>
        </div>
      </form>
    </section>
  );
}
