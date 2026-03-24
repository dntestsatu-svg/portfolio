import Link from "next/link";

type PaginationLink = {
  page: number;
  href: string;
  current?: boolean;
};

type PaginationProps = {
  summary: string;
  previousHref?: string | null;
  nextHref?: string | null;
  links: PaginationLink[];
};

export function Pagination({ summary, previousHref, nextHref, links }: PaginationProps) {
  return (
    <div className="content-pagination">
      <p className="copy-muted text-sm">{summary}</p>
      <div className="content-pagination-links">
        {previousHref ? (
          <Link href={previousHref} className="button-secondary">
            Sebelumnya
          </Link>
        ) : null}

        {links.map((link) => (
          <Link
            key={link.page}
            href={link.href}
            aria-current={link.current ? "page" : undefined}
            className={link.current ? "content-page-link is-active" : "content-page-link"}
          >
            {link.page}
          </Link>
        ))}

        {nextHref ? (
          <Link href={nextHref} className="button-secondary">
            Berikutnya
          </Link>
        ) : null}
      </div>
    </div>
  );
}
