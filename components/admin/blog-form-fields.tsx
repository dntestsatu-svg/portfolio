import Image from "next/image";
import Link from "next/link";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { ArticleItem } from "@/lib/portfolio-data";

type BlogFormFieldsProps = {
  article?: ArticleItem | null;
  mode: "create" | "edit";
};

const categorySuggestions = ["Tutorial", "Engineering", "Case Study", "Release Notes", "Workflow"];

export function BlogFormFields({ article, mode }: BlogFormFieldsProps) {
  const isPublished = article?.published ?? false;
  const primaryActionLabel =
    mode === "edit" ? (isPublished ? "Update & publish" : "Publish artikel") : "Publish artikel";

  return (
    <>
      <input type="hidden" name="published" value={isPublished ? "true" : "false"} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <section className="admin-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="admin-panel-label">Editorial details</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Konten utama artikel</h2>
                <p className="admin-help mt-2 max-w-2xl">
                  Fokuskan area ini untuk menulis judul yang jelas, ringkasan singkat, lalu
                  susun isi artikel dengan struktur heading yang rapi.
                </p>
              </div>
              <span className={`admin-status-chip${isPublished ? " is-published" : " is-draft"}`}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="admin-label">
                  Judul artikel
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="admin-field"
                  defaultValue={article?.title ?? ""}
                  placeholder="Contoh: Membangun alur publish yang rapi di Next.js"
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
                  rows={4}
                  className="admin-textarea"
                  defaultValue={article?.summary ?? ""}
                  placeholder="Ringkasan singkat untuk daftar artikel, metadata, dan preview card."
                  required
                />
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="admin-panel-label">Authoring</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Konten artikel</h2>
              </div>
              <p className="admin-help">
                Markdown disimpan sebagai string, lalu dirender konsisten di preview admin dan
                halaman publik.
              </p>
            </div>

            <div className="mt-4">
              <MarkdownEditor name="content" defaultValue={article?.content ?? ""} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="admin-panel">
            <p className="admin-panel-label">Publishing</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Aksi utama</h2>
            <p className="admin-help mt-2">
              Tentukan apakah artikel tetap menjadi draft atau langsung dipublish ke halaman
              publik.
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
              <Link href="/admin/blog" className="admin-button-ghost admin-button-block">
                Kembali ke daftar
              </Link>
              {article?.published ? (
                <Link href={`/blog/${article.slug}`} className="admin-button-ghost admin-button-block">
                  Buka halaman publik
                </Link>
              ) : (
                <p className="admin-help">
                  Preview publik tersedia setelah artikel berstatus published.
                </p>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">SEO & taxonomy</p>
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
                  defaultValue={article?.slug ?? ""}
                  placeholder="dibuat otomatis bila kosong"
                />
                <p className="admin-help">Digunakan untuk URL `/blog/...` yang SEO-friendly.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="category" className="admin-label">
                  Kategori
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  list="blog-category-options"
                  className="admin-field"
                  defaultValue={article?.category ?? ""}
                  placeholder="Tutorial"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="tags" className="admin-label">
                  Tag
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  className="admin-field"
                  defaultValue={article?.tags?.join(", ") ?? ""}
                  placeholder="nextjs, security, prisma"
                  required
                />
                <p className="admin-help">Pisahkan tag dengan koma.</p>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">Media</p>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="coverImage" className="admin-label">
                  Cover image
                </label>
                <input
                  id="coverImage"
                  name="coverImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="admin-file-input"
                />
                <p className="admin-help">
                  Format yang didukung: JPG, PNG, WEBP. File akan diproses ulang di server.
                </p>
              </div>

              {article?.coverImage ? (
                <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/25">
                  <div className="relative aspect-video">
                    <Image
                      src={article.coverImage}
                      alt={`Cover ${article.title}`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 320px, 100vw"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-panel">
            <p className="admin-panel-label">Panduan cepat</p>
            <ul className="admin-hint-list mt-4">
              <li>Gunakan heading untuk memecah topik besar menjadi section yang mudah dipindai.</li>
              <li>Gunakan blockquote untuk insight atau catatan penting.</li>
              <li>Gunakan code block untuk contoh implementasi yang perlu dibaca utuh.</li>
              <li>Gunakan list berurutan untuk tutorial langkah demi langkah.</li>
            </ul>
          </section>
        </aside>
      </div>

      <datalist id="blog-category-options">
        {categorySuggestions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
