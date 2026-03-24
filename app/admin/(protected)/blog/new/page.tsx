import Link from "next/link";
import { BlogFormFields } from "@/components/admin/blog-form-fields";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { StatusAlert } from "@/components/admin/status-alert";

type BlogCreatePageProps = {
  searchParams: Promise<{
    status?: string;
    error?: string;
  }>;
};

export default async function AdminBlogCreatePage({ searchParams }: BlogCreatePageProps) {
  const query = await searchParams;

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">New article</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Tulis artikel baru
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Editor ini didesain untuk workflow editorial yang lebih serius: tulis konten,
            kelola metadata, lalu simpan sebagai draft atau publish saat siap.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/blog" className="admin-button-secondary">
            Kembali ke daftar
          </Link>
        </div>
      </header>

      <div>
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form action="/api/blog" method="post" encType="multipart/form-data" className="admin-page">
        <CsrfTokenInput />
        <BlogFormFields mode="create" />
      </form>
    </section>
  );
}
