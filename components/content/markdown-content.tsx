import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/content/code-block";
import { extractMarkdownHeadings, prepareMarkdown } from "@/lib/markdown";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className = "markdown-prose" }: MarkdownContentProps) {
  const preparedContent = prepareMarkdown(content);
  const headings = extractMarkdownHeadings(preparedContent);
  let headingIndex = 0;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1() {
            return null;
          },
          h2({ children }) {
            const heading = headings[headingIndex++];
            return <h2 id={heading?.id}>{children}</h2>;
          },
          h3({ children }) {
            const heading = headings[headingIndex++];
            return <h3 id={heading?.id}>{children}</h3>;
          },
          h4({ children }) {
            const heading = headings[headingIndex++];
            return <h4 id={heading?.id}>{children}</h4>;
          },
          a({ href, children }) {
            const external = href?.startsWith("http");

            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          pre({ children }) {
            if (isValidElement<{ className?: string; children?: ReactNode }>(children)) {
              const className = children.props.className;
              const value = String(children.props.children ?? "").replace(/\n$/, "");
              const language = className?.replace("language-", "") || undefined;

              return <CodeBlock code={value} language={language} />;
            }

            return <pre>{children}</pre>;
          },
          code({ children }) {
            return <code>{children}</code>;
          },
          img({ src, alt }) {
            if (!src) {
              return null;
            }

            // eslint-disable-next-line @next/next/no-img-element
            return <img src={src} alt={alt || ""} loading="lazy" decoding="async" />;
          },
          ul({ children }) {
            return <ul>{children as ReactNode}</ul>;
          },
          ol({ children }) {
            return <ol>{children as ReactNode}</ol>;
          },
        }}
      >
        {preparedContent}
      </ReactMarkdown>
    </div>
  );
}
