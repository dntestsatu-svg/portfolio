import Link from "next/link";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminArticles } from "@/lib/services/content";

type BlogAdminPageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminBlogPage({ searchParams }: BlogAdminPageProps) {
  const [query, articles] = await Promise.all([searchParams, getAdminArticles()]);
  const publishedCount = articles.filter((article) => article.published).length;
  const draftCount = articles.length - publishedCount;

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Blog workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Kelola artikel blog
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Gunakan halaman ini untuk meninjau daftar artikel, status editorial, dan masuk ke
            editor saat Anda perlu menulis atau memperbarui konten.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/blog/new" className="admin-button-primary">
            Artikel baru
          </Link>
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-panel-label">Total artikel</span>
          <strong className="admin-stat-value">{articles.length}</strong>
          <span className="admin-help">Semua artikel yang tersimpan di database.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Published</span>
          <strong className="admin-stat-value">{publishedCount}</strong>
          <span className="admin-help">Siap dibaca di halaman publik.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Draft</span>
          <strong className="admin-stat-value">{draftCount}</strong>
          <span className="admin-help">Masih bisa dipoles sebelum dipublish.</span>
        </article>
      </section>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      {articles.length > 0 ? (
        <section className="admin-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-panel-label">Article list</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Daftar artikel</h2>
            </div>
            <p className="admin-help">Klik edit untuk masuk ke editor artikel.</p>
          </div>

          <div className="admin-list mt-4">
            {articles.map((article) => (
              <article key={article.id} className="admin-list-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`admin-status-chip${article.published ? " is-published" : " is-draft"}`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </span>
                    <span className="admin-meta-chip">{article.category}</span>
                    <span className="admin-meta-chip admin-meta-chip-mono">/{article.slug}</span>
                  </div>

                  <h3 className="admin-list-title mt-3">{article.title}</h3>
                  <p className="admin-list-summary mt-2">{article.summary}</p>

                  <div className="admin-row-meta mt-3">
                    <span>
                      Tags: {article.tags && article.tags.length > 0 ? article.tags.join(", ") : "Belum ada"}
                    </span>
                    <span>Terakhir diproses: {article.publishedAt}</span>
                  </div>
                </div>

                <div className="admin-row-actions">
                  {article.published ? (
                    <Link href={`/blog/${article.slug}`} className="admin-button-ghost">
                      Halaman publik
                    </Link>
                  ) : null}
                  <Link href={`/admin/blog/${article.id}`} className="admin-button-secondary">
                    Edit
                  </Link>
                  <form action={`/api/blog/${article.id}`} method="post">
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
          <p className="admin-panel-label">Belum ada artikel</p>
          <h2 className="text-2xl font-semibold text-white">Mulai dari artikel pertama</h2>
          <p className="admin-copy-muted max-w-2xl text-sm">
            Workspace editorial akan jauh lebih berguna setelah artikel pertama dibuat. Mulailah
            dengan judul, ringkasan, lalu tulis isi artikel di editor Markdown yang sudah
            dilengkapi preview.
          </p>
          <ul className="admin-hint-list">
            <li>Siapkan judul, kategori, dan tag utama lebih dulu.</li>
            <li>Tulis isi artikel di editor dengan heading dan list yang rapi.</li>
            <li>Simpan sebagai draft atau publish saat konten sudah siap.</li>
          </ul>
          <Link href="/admin/blog/new" className="admin-button-primary">
            Buat artikel pertama
          </Link>
        </section>
      )}
    </section>
  );
}
