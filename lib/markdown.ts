import { slugify } from "@/lib/slug";

export type MarkdownHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

function stripMarkdownDecorators(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function stripLeadingTitleHeading(markdown: string) {
  const normalized = markdown.replace(/\r\n/g, "\n").trimStart();
  return normalized.replace(/^#\s+.+?\n+(?=\S)/, "");
}

export function prepareMarkdown(markdown: string) {
  return stripLeadingTitleHeading(markdown).trim();
}

export function extractMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const content = prepareMarkdown(markdown);
  const matches = [...content.matchAll(/^(#{2,4})\s+(.+)$/gm)];
  const seen = new Map<string, number>();

  return matches.map((match) => {
    const level = Math.min(Math.max(match[1].length, 2), 4) as 2 | 3 | 4;
    const text = stripMarkdownDecorators(match[2]);
    const baseId = slugify(text) || "section";
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);

    return {
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      text,
      level,
    };
  });
}

export function markdownToPlainText(markdown: string) {
  return prepareMarkdown(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getMarkdownWordCount(markdown: string) {
  const plainText = markdownToPlainText(markdown);

  if (!plainText) {
    return 0;
  }

  return plainText.split(/\s+/).filter(Boolean).length;
}

export function getReadingTimeMinutes(markdown: string, wordsPerMinute = 220) {
  const wordCount = getMarkdownWordCount(markdown);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
