import { notFound } from "next/navigation";
import Link from "next/link";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { BlogFormFields } from "@/components/admin/blog-form-fields";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminArticleById } from "@/lib/services/content";

type BlogEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminBlogEditPage({
  params,
  searchParams,
}: BlogEditPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const article = await getAdminArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Edit article</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {article.title}
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Perubahan akan memperbarui slug artikel bila perlu dan memicu revalidation konten
            publik setelah disimpan.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/blog" className="admin-button-secondary">
            Kembali ke daftar
          </Link>
          {article.published ? (
            <Link href={`/blog/${article.slug}`} className="admin-button-ghost">
              Buka publik
            </Link>
          ) : null}
        </div>
      </header>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form
        action={`/api/blog/${article.id}`}
        method="post"
        encType="multipart/form-data"
        className="admin-page"
      >
        <CsrfTokenInput />
        <BlogFormFields article={article} mode="edit" />
      </form>

      <section className="admin-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="admin-panel-label">Danger zone</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Hapus artikel</h2>
            <p className="admin-help mt-2 max-w-2xl">
              Gunakan aksi ini hanya jika artikel memang harus dihapus dari dashboard dan halaman
              publik.
            </p>
          </div>

          <form action={`/api/blog/${article.id}`} method="post">
            <CsrfTokenInput />
            <input type="hidden" name="_method" value="DELETE" />
            <button type="submit" className="admin-button-danger">
              Hapus artikel
            </button>
          </form>
        </div>
      </section>
    </section>
  );
}
