import Link from "next/link";
import type { ArticleItem } from "@/lib/portfolio-data";

type ArticleCardProps = {
  article: ArticleItem & {
    readingTime?: number;
    categorySlug?: string;
    tagsDetailed?: Array<{ label: string; slug: string }>;
    updatedAtLabel?: string;
  };
  showAction?: boolean;
};

export function ArticleCard({ article, showAction = true }: ArticleCardProps) {
  return (
    <article className="content-card content-card--article">
      <div className="content-card-meta">
        <Link
          href={
            article.categorySlug
              ? `/blog/category/${article.categorySlug}`
              : `/blog/${article.slug}`
          }
          className="tag-chip-subtle"
        >
          {article.category}
        </Link>
        <span>{article.publishedAt}</span>
        {article.readingTime ? <span>{article.readingTime} menit baca</span> : null}
      </div>

      <h3 className="content-card-title">
        <Link href={article.href ?? `/blog/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="content-card-summary">{article.summary}</p>

      {article.tagsDetailed && article.tagsDetailed.length > 0 ? (
        <div className="content-chip-row mt-5">
          {article.tagsDetailed.slice(0, 4).map((tag) => (
            <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="tag-chip-subtle">
              #{tag.label}
            </Link>
          ))}
        </div>
      ) : null}

      {showAction ? (
        <div className="mt-auto pt-6">
          <Link href={article.href ?? `/blog/${article.slug}`} className="button-secondary">
            Baca selengkapnya
          </Link>
        </div>
      ) : null}
    </article>
  );
}
