import { notFound } from "next/navigation";
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
    <section className="surface-panel rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-white">Edit artikel</h2>
      <p className="copy-muted mt-2 text-sm">
        Perubahan akan memperbarui halaman slug artikel dan memicu revalidation konten publik.
      </p>

      <div className="mt-6">
        <StatusAlert status={query.status} error={query.error} />
      </div>

      <form
        action={`/api/blog/${article.id}`}
        method="post"
        encType="multipart/form-data"
        className="mt-6"
      >
        <CsrfTokenInput />
        <BlogFormFields article={article} />

        <div className="mt-6">
          <button type="submit" className="button-primary">
            Simpan perubahan
          </button>
        </div>
      </form>
    </section>
  );
}
