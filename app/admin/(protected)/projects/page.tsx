import Link from "next/link";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminProjects } from "@/lib/services/content";

type ProjectsAdminPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

function formatAdminDate(value?: string) {
  if (!value) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminProjectsPage({ searchParams }: ProjectsAdminPageProps) {
  const [query, projects] = await Promise.all([searchParams, getAdminProjects()]);
  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;
  const draftCount = projects.length - publishedCount;

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Project workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Kelola project portfolio
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Tinjau daftar project, cek status publish dan featured, lalu masuk ke editor saat Anda
            perlu memperbarui studi kasus, detail implementasi, stack, atau media.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/projects/new" className="admin-button-primary">
            Project baru
          </Link>
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-panel-label">Total project</span>
          <strong className="admin-stat-value">{projects.length}</strong>
          <span className="admin-help">Semua project yang tersimpan di database.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Published</span>
          <strong className="admin-stat-value">{publishedCount}</strong>
          <span className="admin-help">Sudah tampil di halaman publik.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Featured</span>
          <strong className="admin-stat-value">{featuredCount}</strong>
          <span className="admin-help">Naik prioritas pada daftar project publik.</span>
        </article>
      </section>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      {projects.length > 0 ? (
        <section className="admin-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-panel-label">Project list</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Daftar project</h2>
            </div>
            <p className="admin-help">{draftCount} project masih berada pada status draft.</p>
          </div>

          <div className="admin-list mt-4">
            {projects.map((project) => (
              <article key={project.id} className="admin-list-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`admin-status-chip${project.published ? " is-published" : " is-draft"}`}
                    >
                      {project.published ? "Published" : "Draft"}
                    </span>
                    {project.featured ? <span className="admin-meta-chip">Featured</span> : null}
                    <span className="admin-meta-chip">{project.category}</span>
                    <span className="admin-meta-chip admin-meta-chip-mono">/{project.slug}</span>
                  </div>

                  <h3 className="admin-list-title mt-3">{project.name}</h3>
                  <p className="admin-list-summary mt-2">{project.summary}</p>

                  <div className="admin-row-meta mt-3">
                    <span>Stack: {project.techStack.join(", ")}</span>
                    <span>Updated: {formatAdminDate(project.updatedAt)}</span>
                  </div>
                </div>

                <div className="admin-row-actions">
                  {project.published ? (
                    <Link href={`/projects/${project.slug}`} className="admin-button-ghost">
                      Halaman publik
                    </Link>
                  ) : null}
                  <Link href={`/admin/projects/${project.id}`} className="admin-button-secondary">
                    Edit
                  </Link>
                  <form action={`/api/projects/${project.id}`} method="post">
                    <CsrfTokenInput />
                    <input type="hidden" name="_method" value="DELETE" />
                    <button type="submit" className="admin-button-danger">
                      Hapus
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-empty-state">
          <p className="admin-panel-label">Belum ada project</p>
          <h2 className="text-2xl font-semibold text-white">Mulai dari studi kasus pertama</h2>
          <p className="admin-copy-muted max-w-2xl text-sm">
            Buat project pertama untuk mengisi halaman portfolio publik. Tulis ringkasan yang
            jelas, tambahkan detail implementasi, lalu lengkapi stack, fitur, dan thumbnail.
          </p>
          <ul className="admin-hint-list">
            <li>Mulai dari nama project, kategori, dan ringkasan yang mudah dipindai.</li>
            <li>Tuliskan detail implementasi dalam format Markdown agar rapi saat dipublish.</li>
            <li>Gunakan status draft sampai copy dan media sudah siap.</li>
          </ul>
          <Link href="/admin/projects/new" className="admin-button-primary">
            Buat project pertama
          </Link>
        </section>
      )}
    </section>
  );
}
