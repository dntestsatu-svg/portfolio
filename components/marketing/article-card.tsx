import Link from "next/link";
import type { ArticleItem } from "@/lib/portfolio-data";

type ArticleCardProps = {
  article: ArticleItem;
  showAction?: boolean;
};

export function ArticleCard({ article, showAction = true }: ArticleCardProps) {
  return (
    <article className="surface-panel flex h-full flex-col rounded-[2rem] p-6">
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        <span className="tag-chip-subtle">{article.category}</span>
        <span>{article.publishedAt}</span>
      </div>

      <h3 className="mt-5 text-xl font-semibold leading-tight text-white">{article.title}</h3>
      <p className="copy-muted mt-4 text-sm">{article.summary}</p>

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
