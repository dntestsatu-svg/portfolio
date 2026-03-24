import { describe, expect, test } from "bun:test";
import {
  extractMarkdownHeadings,
  getMarkdownWordCount,
  prepareMarkdown,
} from "../lib/markdown";
import { buildRelativeScore, pageHref, tokenizeSearchQuery } from "../lib/services/discovery-utils";

describe("markdown helpers", () => {
  test("strips the leading H1 so article pages do not render duplicate titles", () => {
    const input = "# Judul Utama\n\n## Section Satu\nKonten paragraf.";

    expect(prepareMarkdown(input)).toBe("## Section Satu\nKonten paragraf.");
  });

  test("extracts stable headings for TOC generation", () => {
    const headings = extractMarkdownHeadings(
      "## Setup VPS\n### Hardening SSH\n## Setup VPS\n### UFW",
    );

    expect(headings).toEqual([
      { id: "setup-vps", text: "Setup VPS", level: 2 },
      { id: "hardening-ssh", text: "Hardening SSH", level: 3 },
      { id: "setup-vps-2", text: "Setup VPS", level: 2 },
      { id: "ufw", text: "UFW", level: 3 },
    ]);
  });

  test("counts readable words from markdown content", () => {
    expect(getMarkdownWordCount("## Halo\n\nIni **contoh** `kode` sederhana.")).toBe(5);
  });
});

describe("discovery helpers", () => {
  test("tokenizes meaningful search terms", () => {
    expect(tokenizeSearchQuery("  Next.js   caching app  ")).toEqual([
      "next.js",
      "caching",
      "app",
    ]);
  });

  test("gives a higher score to stronger field matches", () => {
    const titleScore = buildRelativeScore([{ value: "Next.js caching guide", weight: 8 }], "caching");
    const bodyScore = buildRelativeScore([{ value: "guide tentang caching", weight: 2 }], "caching");

    expect(titleScore).toBeGreaterThan(bodyScore);
  });

  test("builds stable pagination hrefs without leaking page=1", () => {
    const currentParams = new URLSearchParams({
      q: "nextjs",
      sort: "updated",
    });

    expect(pageHref("/blog/search", currentParams, 1)).toBe("/blog/search?q=nextjs&sort=updated");
    expect(pageHref("/blog/search", currentParams, 3)).toBe(
      "/blog/search?q=nextjs&sort=updated&page=3",
    );
  });
});
