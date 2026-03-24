import { revalidatePath } from "next/cache";

export function revalidatePortfolioContent(options?: {
  slug?: string;
  previousSlug?: string | null;
  type?: "project" | "blog";
  categorySlugs?: string[];
  tagSlugs?: string[];
}) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");

  const type = options?.type;
  const currentSlug = options?.slug;
  const previousSlug = options?.previousSlug;

  if (type === "project" && previousSlug) {
    revalidatePath(`/projects/${previousSlug}`);
  }

  if (type === "project" && currentSlug) {
    revalidatePath(`/projects/${currentSlug}`);
  }

  if (type === "blog" && previousSlug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  if (type === "blog" && currentSlug) {
    revalidatePath(`/blog/${currentSlug}`);
  }

  if (type === "blog") {
    for (const categorySlug of new Set(options?.categorySlugs?.filter(Boolean) ?? [])) {
      revalidatePath(`/blog/category/${categorySlug}`);
    }

    for (const tagSlug of new Set(options?.tagSlugs?.filter(Boolean) ?? [])) {
      revalidatePath(`/blog/tag/${tagSlug}`);
    }
  }

  if (type === "project") {
    for (const categorySlug of new Set(options?.categorySlugs?.filter(Boolean) ?? [])) {
      revalidatePath(`/projects/category/${categorySlug}`);
    }
  }
}
