import type { MarkdownHeading } from "@/lib/markdown";

type TocProps = {
  headings: MarkdownHeading[];
};

export function Toc({ headings }: TocProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Daftar isi artikel" className="content-toc">
      <p className="content-sidebar-title">Daftar isi</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
