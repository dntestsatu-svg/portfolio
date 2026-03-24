import type { ProjectItem } from "@/lib/portfolio-data";

type ProjectFormFieldsProps = {
  project?: ProjectItem | null;
};

export function ProjectFormFields({ project }: ProjectFormFieldsProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-200">
            Judul project
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="field-input"
            defaultValue={project?.name ?? ""}
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
            defaultValue={project?.slug ?? ""}
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
          defaultValue={project?.category ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="summary" className="text-sm font-medium text-slate-200">
          Ringkasan singkat
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          className="field-input resize-none"
          defaultValue={project?.summary ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="description" className="text-sm font-medium text-slate-200">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="field-input resize-none"
          defaultValue={project?.description ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="body" className="text-sm font-medium text-slate-200">
          Detail project
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          className="field-input resize-y"
          defaultValue={project?.body ?? ""}
          required
        />
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="tutorial" className="text-sm font-medium text-slate-200">
          Tutorial penggunaan
        </label>
        <textarea
          id="tutorial"
          name="tutorial"
          rows={6}
          className="field-input resize-y"
          defaultValue={project?.tutorial ?? ""}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="techStack" className="text-sm font-medium text-slate-200">
            Tech stack
          </label>
          <input
            id="techStack"
            name="techStack"
            type="text"
            className="field-input"
            defaultValue={project?.techStack.join(", ") ?? ""}
            placeholder="Next.js, TypeScript, MySQL"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="features" className="text-sm font-medium text-slate-200">
            Fitur utama
          </label>
          <input
            id="features"
            name="features"
            type="text"
            className="field-input"
            defaultValue={project?.features.join(", ") ?? ""}
            placeholder="CRUD, Upload, Dashboard"
            required
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="demoUrl" className="text-sm font-medium text-slate-200">
            Demo URL
          </label>
          <input
            id="demoUrl"
            name="demoUrl"
            type="url"
            className="field-input"
            defaultValue={project?.demoUrl ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="repoUrl" className="text-sm font-medium text-slate-200">
            Repository URL
          </label>
          <input
            id="repoUrl"
            name="repoUrl"
            type="url"
            className="field-input"
            defaultValue={project?.repoUrl ?? ""}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <label htmlFor="thumbnail" className="text-sm font-medium text-slate-200">
          Thumbnail
        </label>
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="field-input file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            name="published"
            defaultChecked={project?.published ?? false}
          />
          Publish
        </label>

        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured ?? false}
          />
          Featured
        </label>
      </div>
    </>
  );
}
