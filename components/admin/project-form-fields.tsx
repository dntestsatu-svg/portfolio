import Image from "next/image";
import Link from "next/link";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { ProjectItem } from "@/lib/portfolio-data";

type ProjectFormFieldsProps = {
  project?: ProjectItem | null;
  mode: "create" | "edit";
};

const categorySuggestions = [
  "Internal Tool",
  "Dashboard",
  "Portal",
  "Service Platform",
  "Case Study",
];

export function ProjectFormFields({ project, mode }: ProjectFormFieldsProps) {
  const isPublished = project?.published ?? false;
  const isFeatured = project?.featured ?? false;
  const primaryActionLabel =
    mode === "edit" ? (isPublished ? "Update project" : "Publish project") : "Publish project";

  return (
    <>
      <input type="hidden" name="published" value={isPublished ? "true" : "false"} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="admin-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="admin-panel-label">Project overview</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Informasi inti project</h2>
                <p className="admin-help mt-2 max-w-2xl">
                  Tuliskan identitas project dengan jelas: nama, ringkasan nilai utamanya, lalu
                  deskripsi singkat yang membantu admin lain memahami konteks project dengan cepat.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`admin-status-chip${isPublished ? " is-published" : " is-draft"}`}>
                  {isPublished ? "Published" : "Draft"}
                </span>
                {isFeatured ? <span className="admin-meta-chip">Featured</span> : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="admin-label">
                  Nama project
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="admin-field"
                  defaultValue={project?.name ?? ""}
                  placeholder="Contoh: Internal Operations Dashboard"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="summary" className="admin-label">
                  Ringkasan
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  className="admin-textarea"
                  defaultValue={project?.summary ?? ""}
                  placeholder="Ringkasan singkat untuk card project, metadata, dan daftar admin."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="admin-label">
                  Deskripsi singkat
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="admin-textarea"
                  defaultValue={project?.description ?? ""}
                  placeholder="Deskripsi singkat yang menjelaskan tujuan, konteks, dan nilai project."
                  required
                />
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="admin-panel-label">Implementation details</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Detail implementasi</h2>
              </div>
              <p className="admin-help">
                Gunakan Markdown untuk studi kasus, arsitektur, keputusan teknis, dan highlight
                implementasi.
              </p>
            </div>

            <div className="mt-4">
              <MarkdownEditor name="body" defaultValue={project?.body ?? ""} />
            </div>
          </section>

          <section className="admin-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="admin-panel-label">Tutorial</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Catatan penggunaan atau onboarding
                </h2>
              </div>
              <p className="admin-help">
                Opsional, tetapi berguna jika project perlu penjelasan setup, alur penggunaan,
                atau langkah demo.
              </p>
            </div>

            <div className="mt-4">
              <MarkdownEditor
                name="tutorial"
                defaultValue={project?.tutorial ?? ""}
                initialView="write"
                size="compact"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="admin-panel">
            <p className="admin-panel-label">Publishing</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Aksi utama</h2>
            <p className="admin-help mt-2">
              Simpan project sebagai draft sampai detailnya lengkap, lalu publish saat halaman
              publik sudah siap dilihat.
            </p>

            <div className="mt-4 grid gap-3">
              <button
                type="submit"
                name="published"
                value="false"
                className="admin-button-secondary admin-button-block"
              >
                Simpan draft
              </button>
              <button
                type="submit"
                name="published"
                value="true"
                className="admin-button-primary admin-button-block"
              >
                {primaryActionLabel}
              </button>
              <Link href="/admin/projects" className="admin-button-ghost admin-button-block">
                Kembali ke daftar
              </Link>
              {project?.published ? (
                <Link
                  href={`/projects/${project.slug}`}
                  className="admin-button-ghost admin-button-block"
                >
                  Buka halaman publik
                </Link>
              ) : (
                <p className="admin-help">
                  Halaman publik akan lebih relevan setelah status project menjadi published.
                </p>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">Routing & visibility</p>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="slug" className="admin-label">
                  Slug
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  className="admin-field admin-field-mono"
                  defaultValue={project?.slug ?? ""}
                  placeholder="dibuat otomatis bila kosong"
                />
                <p className="admin-help">Digunakan untuk URL `/projects/...` yang bersih.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="category" className="admin-label">
                  Kategori
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  list="project-category-options"
                  className="admin-field"
                  defaultValue={project?.category ?? ""}
                  placeholder="Dashboard"
                  required
                />
              </div>

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={isFeatured}
                  className="admin-checkbox"
                />
                <span>
                  <span className="admin-checkbox-label">Tandai sebagai featured</span>
                  <span className="admin-help block mt-1">
                    Project featured akan naik prioritas di daftar publik.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">Stack & links</p>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="techStack" className="admin-label">
                  Tech stack
                </label>
                <input
                  id="techStack"
                  name="techStack"
                  type="text"
                  className="admin-field"
                  defaultValue={project?.techStack.join(", ") ?? ""}
                  placeholder="Next.js, TypeScript, MySQL"
                  required
                />
                <p className="admin-help">Pisahkan item dengan koma.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="features" className="admin-label">
                  Fitur utama
                </label>
                <input
                  id="features"
                  name="features"
                  type="text"
                  className="admin-field"
                  defaultValue={project?.features.join(", ") ?? ""}
                  placeholder="Dashboard, Upload, Audit log"
                  required
                />
                <p className="admin-help">Pisahkan item dengan koma.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="demoUrl" className="admin-label">
                  Demo URL
                </label>
                <input
                  id="demoUrl"
                  name="demoUrl"
                  type="url"
                  className="admin-field"
                  defaultValue={project?.demoUrl ?? ""}
                  placeholder="https://demo.example.com"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="repoUrl" className="admin-label">
                  Repository URL
                </label>
                <input
                  id="repoUrl"
                  name="repoUrl"
                  type="url"
                  className="admin-field"
                  defaultValue={project?.repoUrl ?? ""}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">Media</p>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="thumbnail" className="admin-label">
                  Thumbnail
                </label>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="admin-file-input"
                />
                <p className="admin-help">
                  Format yang didukung: JPG, PNG, WEBP. File akan diproses ulang di server.
                </p>
              </div>

              {project?.thumbnail ? (
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/25">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={project.thumbnail}
                      alt={project.thumbnailAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 320px, 100vw"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      <datalist id="project-category-options">
        {categorySuggestions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
