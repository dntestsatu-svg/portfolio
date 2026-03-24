import type { ArticleItem } from "@/lib/portfolio-data";

type BlogFormFieldsProps = {
  article?: ArticleItem | null;
};

export function BlogFormFields({ article }: BlogFormFieldsProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-200">
            Judul artikel
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="field-input"
            defaultValue={article?.title ?? ""}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="slug" className="text-sm font-medium text-slate-200">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            className="field-input"
            defaultValue={article?.slug ?? ""}
            placeholder="opsional, akan dibuat otomatis"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="category" className="text-sm font-medium text-slate-200">
          Kategori
        </label>
        <input
          id="category"
          name="category"
          type="text"
          className="field-input"
          defaultValue={article?.category ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="summary" className="text-sm font-medium text-slate-200">
          Ringkasan
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          className="field-input resize-none"
          defaultValue={article?.summary ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="content" className="text-sm font-medium text-slate-200">
          Konten artikel
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          className="field-input resize-y"
          defaultValue={article?.content ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="tags" className="text-sm font-medium text-slate-200">
            Tag
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="field-input"
            defaultValue={article?.tags?.join(", ") ?? ""}
            placeholder="seo, backend, nextjs"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="coverImage" className="text-sm font-medium text-slate-200">
            Cover image
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article?.published ?? false}
          />
          Publish
        </label>
      </div>
    </>
  );
}
