import type { MarkdownHeading } from "@/lib/markdown";

type TocProps = {
  headings: MarkdownHeading[];
  variant?: "desktop" | "mobile";
};

function getTocItems(headings: MarkdownHeading[]) {
  const primaryHeadings = headings.filter((heading) => heading.level === 2);
  const fallbackHeadings = headings.filter((heading) => heading.level <= 3);
  const items = (primaryHeadings.length >= 2 ? primaryHeadings : fallbackHeadings).slice(0, 8);

  return {
    items,
    hiddenCount: Math.max(headings.length - items.length, 0),
  };
}

export function Toc({ headings, variant = "desktop" }: TocProps) {
  const { items, hiddenCount } = getTocItems(headings);

  if (items.length === 0) {
    return null;
  }

  if (variant === "mobile") {
    return (
      <details className="content-toc-mobile">
        <summary>
          <span className="content-sidebar-title">Daftar isi</span>
          <span className="content-toc-meta">{items.length} bagian utama</span>
        </summary>
        <ol>
          {items.map((heading) => (
            <li key={heading.id} data-level={heading.level}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
        {hiddenCount > 0 ? (
          <p className="content-toc-note">
            {hiddenCount} sub-bagian lain tetap muncul di dalam artikel saat Anda scroll.
          </p>
        ) : null}
      </details>
    );
  }

  return (
    <nav aria-label="Daftar isi artikel" className="content-toc">
      <p className="content-sidebar-title">Daftar isi</p>
      <p className="content-toc-note">Menampilkan struktur utama artikel agar cepat dipindai.</p>
      <ol>
        {items.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
      {hiddenCount > 0 ? (
        <p className="content-toc-note">
          {hiddenCount} sub-bagian lain tetap muncul di dalam isi artikel.
        </p>
      ) : null}
    </nav>
  );
}
