import Link from "next/link";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { BlogFormFields } from "@/components/admin/blog-form-fields";
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

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold text-white">Blog list</h2>
        <p className="copy-muted mt-2 text-sm">
          Kelola artikel, slug, kategori, tag, cover image, dan status publish/draft.
        </p>

        <div className="mt-6">
          <StatusAlert status={query.status} error={query.error} />
        </div>

        <div className="mt-6 grid gap-4">
          {articles.length > 0 ? (
            articles.map((article) => (
              <article key={article.id} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="tag-chip-subtle">{article.category}</span>
                      <span className="tag-chip-subtle">{article.slug}</span>
                      <span className="tag-chip-subtle">
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{article.title}</h3>
                    <p className="copy-muted text-sm">{article.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link href={`/blog/${article.slug}`} className="button-secondary">
                      Public page
                    </Link>
                    <Link href={`/admin/blog/${article.id}`} className="button-secondary">
                      Edit
                    </Link>
                    <form action={`/api/blog/${article.id}`} method="post">
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
              Belum ada artikel di database. Gunakan form di sisi kanan untuk membuat konten pertama.
            </p>
          )}
        </div>
      </div>

      <section className="surface-panel rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold text-white">Tambah artikel</h2>
        <form action="/api/blog" method="post" encType="multipart/form-data" className="mt-6">
          <CsrfTokenInput />
          <BlogFormFields />

          <div className="mt-6">
            <button type="submit" className="button-primary">
              Simpan artikel
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
