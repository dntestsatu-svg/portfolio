import type { ArticleItem } from "@/lib/portfolio-data";
import {
  extractMarkdownHeadings,
  getMarkdownWordCount,
  getReadingTimeMinutes,
  markdownToPlainText,
  prepareMarkdown,
} from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import { getPublicArticles } from "@/lib/services/content";
import {
  buildRelativeScore,
  paginate,
  sortByLatest,
  sortByUpdated,
  type PaginationResult,
  type TaxonomyCount,
  uniqueTaxonomy,
} from "@/lib/services/discovery-utils";

export type BlogTag = {
  label: string;
  slug: string;
};

export type BlogArticle = ArticleItem & {
  href: string;
  categorySlug: string;
  tagsDetailed: BlogTag[];
  preparedContent: string;
  plainText: string;
  wordCount: number;
  readingTime: number;
  headings: ReturnType<typeof extractMarkdownHeadings>;
  publishedAtISO: string;
  updatedAtISO: string;
  updatedAtLabel: string;
};

export type BlogCollection = {
  items: BlogArticle[];
  pagination: PaginationResult;
  categories: TaxonomyCount[];
  tags: TaxonomyCount[];
  latestArticles: BlogArticle[];
  featuredArticle: BlogArticle | null;
};

export type BlogSortOption = "featured" | "latest" | "updated";

function fallbackIsoDate(index: number) {
  return new Date(Date.UTC(2026, 2, 24 - index)).toISOString();
}

function enrichArticle(article: ArticleItem, index: number): BlogArticle {
  const preparedContent = prepareMarkdown(article.content ?? article.summary);
  const plainText = markdownToPlainText(preparedContent);
  const publishedAtISO = article.publishedAtISO ?? article.updatedAtISO ?? fallbackIsoDate(index);
  const updatedAtISO = article.updatedAtISO ?? publishedAtISO;

  return {
    ...article,
    href: article.href ?? `/blog/${article.slug}`,
    categorySlug: slugify(article.category),
    tagsDetailed: (article.tags ?? []).map((tag) => ({
      label: tag,
      slug: slugify(tag),
    })),
    preparedContent,
    plainText,
    wordCount: getMarkdownWordCount(preparedContent),
    readingTime: getReadingTimeMinutes(preparedContent),
    headings: extractMarkdownHeadings(preparedContent),
    publishedAtISO,
    updatedAtISO,
    updatedAtLabel: article.updatedAtLabel ?? article.publishedAt,
  };
}

async function getAllArticles() {
  const articles = await getPublicArticles();
  return articles.map(enrichArticle);
}

function getArticleTaxonomy(articles: BlogArticle[]) {
  return {
    categories: uniqueTaxonomy(articles.map((article) => article.category)),
    tags: uniqueTaxonomy(articles.flatMap((article) => article.tagsDetailed.map((tag) => tag.label))),
  };
}

function sortArticles(articles: BlogArticle[], sort: BlogSortOption) {
  switch (sort) {
    case "updated":
      return sortByUpdated(articles);
    case "featured":
      return [...sortByLatest(articles)].sort((left, right) => {
        if (right.wordCount !== left.wordCount) {
          return right.wordCount - left.wordCount;
        }

        return new Date(right.publishedAtISO).getTime() - new Date(left.publishedAtISO).getTime();
      });
    case "latest":
    default:
      return sortByLatest(articles);
  }
}

function pickFeaturedArticle(articles: BlogArticle[]) {
  const [featured] = sortByLatest(articles);
  return featured ?? null;
}

export async function getBlogArchive(options?: {
  page?: number;
  pageSize?: number;
  sort?: BlogSortOption;
}) {
  const articles = await getAllArticles();
  const { categories, tags } = getArticleTaxonomy(articles);
  const featuredArticle = pickFeaturedArticle(articles);
  const collection = featuredArticle
    ? articles.filter((article) => article.slug !== featuredArticle.slug)
    : articles;
  const sorted = sortArticles(collection, options?.sort ?? "latest");
  const { items, pagination } = paginate(sorted, options?.page ?? 1, options?.pageSize ?? 6);

  return {
    items,
    pagination,
    categories,
    tags,
    latestArticles: sortByLatest(articles).slice(0, 5),
    featuredArticle,
  } satisfies BlogCollection;
}

export async function getBlogArticleBySlug(slug: string) {
  const articles = await getAllArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

function rankRelatedArticles(current: BlogArticle, candidates: BlogArticle[]) {
  const currentTagLabels = new Set(current.tagsDetailed.map((tag) => tag.label.toLowerCase()));
  const keywordQuery = `${current.title} ${current.category} ${current.tagsDetailed
    .map((tag) => tag.label)
    .join(" ")}`;

  return [...candidates]
    .map((candidate) => {
      let score = 0;

      if (candidate.categorySlug === current.categorySlug) {
        score += 40;
      }

      for (const tag of candidate.tagsDetailed) {
        if (currentTagLabels.has(tag.label.toLowerCase())) {
          score += 12;
        }
      }

      score += buildRelativeScore(
        [
          { value: candidate.title, weight: 5 },
          { value: candidate.summary, weight: 3 },
          { value: candidate.plainText, weight: 1 },
        ],
        keywordQuery,
      );

      return {
        candidate,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(right.candidate.publishedAtISO).getTime() - new Date(left.candidate.publishedAtISO).getTime();
    })
    .map((item) => item.candidate);
}

export async function getRelatedArticles(slug: string, limit = 4) {
  const articles = await getAllArticles();
  const current = articles.find((article) => article.slug === slug);

  if (!current) {
    return [];
  }

  const candidates = articles.filter((article) => article.slug !== slug);
  const ranked = rankRelatedArticles(current, candidates);
  const meaningful = ranked.filter((article) => article.categorySlug === current.categorySlug || article.tagsDetailed.some((tag) => current.tagsDetailed.some((currentTag) => currentTag.slug === tag.slug)));

  if (meaningful.length >= limit) {
    return meaningful.slice(0, limit);
  }

  const fallback = sortByLatest(candidates).filter(
    (article) => !meaningful.some((entry) => entry.slug === article.slug),
  );

  return [...meaningful, ...fallback].slice(0, limit);
}

export async function getAdjacentArticles(slug: string) {
  const articles = sortByLatest(await getAllArticles());
  const index = articles.findIndex((article) => article.slug === slug);

  if (index === -1) {
    return {
      previousArticle: null,
      nextArticle: null,
    };
  }

  return {
    previousArticle: articles[index - 1] ?? null,
    nextArticle: articles[index + 1] ?? null,
  };
}

export async function getBlogCategoryPage(
  slug: string,
  options?: { page?: number; pageSize?: number; sort?: BlogSortOption },
) {
  const articles = await getAllArticles();
  const { categories, tags } = getArticleTaxonomy(articles);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return null;
  }

  const filtered = articles.filter((article) => article.categorySlug === slug);
  const sorted = sortArticles(filtered, options?.sort ?? "latest");
  const { items, pagination } = paginate(sorted, options?.page ?? 1, options?.pageSize ?? 6);

  return {
    taxonomy: category,
    description: `${category.count} artikel membahas topik ${category.label.toLowerCase()} dari perspektif implementasi, arsitektur, dan praktik engineering yang bisa langsung dipakai.`,
    items,
    pagination,
    categories,
    tags,
    latestArticles: sortByLatest(articles).slice(0, 5),
  };
}

export async function getBlogTagPage(
  slug: string,
  options?: { page?: number; pageSize?: number },
) {
  const articles = await getAllArticles();
  const { categories, tags } = getArticleTaxonomy(articles);
  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    return null;
  }

  const filtered = articles.filter((article) =>
    article.tagsDetailed.some((entry) => entry.slug === slug),
  );
  const sorted = sortByLatest(filtered);
  const { items, pagination } = paginate(sorted, options?.page ?? 1, options?.pageSize ?? 6);

  return {
    taxonomy: tag,
    description: `${tag.count} artikel terkait tag ${tag.label} untuk membantu pembaca menemukan topik yang saling berhubungan tanpa harus mulai dari awal.`,
    items,
    pagination,
    categories,
    tags,
    latestArticles: sortByLatest(articles).slice(0, 5),
    shouldIndex: tag.count >= 2,
  };
}

export async function searchBlogArticles(options: {
  query: string;
  page?: number;
  pageSize?: number;
}) {
  const articles = await getAllArticles();
  const { categories, tags } = getArticleTaxonomy(articles);
  const query = options.query.trim();

  if (!query) {
    return {
      query,
      items: [] as BlogArticle[],
      pagination: paginate<BlogArticle>([], options.page ?? 1, options.pageSize ?? 6).pagination,
      categories,
      tags,
      latestArticles: sortByLatest(articles).slice(0, 5),
    };
  }

  const ranked = [...articles]
    .map((article) => ({
      article,
      score: buildRelativeScore(
        [
          { value: article.title, weight: 8 },
          { value: article.summary, weight: 5 },
          { value: article.plainText, weight: 2 },
          { value: article.category, weight: 4 },
          { value: article.tagsDetailed.map((tag) => tag.label).join(" "), weight: 4 },
        ],
        query,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(right.article.updatedAtISO).getTime() - new Date(left.article.updatedAtISO).getTime();
    })
    .map((item) => item.article);

  const { items, pagination } = paginate(ranked, options.page ?? 1, options.pageSize ?? 6);

  return {
    query,
    items,
    pagination,
    categories,
    tags,
    latestArticles: sortByLatest(articles).slice(0, 5),
  };
}

export async function getLatestArticles(limit = 5) {
  return sortByLatest(await getAllArticles()).slice(0, limit);
}

export async function getBlogTaxonomies() {
  const articles = await getAllArticles();
  return getArticleTaxonomy(articles);
}

export async function getIndexableBlogTags() {
  const { tags } = await getBlogTaxonomies();
  return tags.filter((tag) => tag.count >= 2);
}

export async function getAllBlogArticles() {
  return getAllArticles();
}

export async function getBlogSlugs() {
  const articles = await getAllArticles();
  return articles.map((article) => article.slug);
}
