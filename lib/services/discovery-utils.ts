import { slugify } from "@/lib/slug";

export type SortOption = "featured" | "latest" | "updated" | "relevant";

export type PaginationResult = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type TaxonomyCount = {
  label: string;
  slug: string;
  count: number;
};

function normalizeDate(value?: string | null) {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function tokenizeSearchQuery(query: string) {
  return normalizeSearchText(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

export function uniqueTaxonomy(values: string[]) {
  const counts = new Map<string, TaxonomyCount>();

  for (const value of values) {
    const label = value.trim();
    if (!label) {
      continue;
    }

    const slug = slugify(label);
    const current = counts.get(slug);
    if (current) {
      current.count += 1;
      continue;
    }

    counts.set(slug, {
      label,
      slug,
      count: 1,
    });
  }

  return [...counts.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label, "id");
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  const slicedItems = items.slice(start, start + safePageSize);

  const pagination: PaginationResult = {
    page: safePage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };

  return {
    items: slicedItems,
    pagination,
  };
}

export function sortByLatest<T extends { publishedAtISO?: string; updatedAtISO?: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      normalizeDate(right.publishedAtISO ?? right.updatedAtISO) -
      normalizeDate(left.publishedAtISO ?? left.updatedAtISO),
  );
}

export function sortByUpdated<T extends { updatedAtISO?: string; publishedAtISO?: string }>(items: T[]) {
  return [...items].sort(
    (left, right) =>
      normalizeDate(right.updatedAtISO ?? right.publishedAtISO) -
      normalizeDate(left.updatedAtISO ?? left.publishedAtISO),
  );
}

export function buildRelativeScore(haystacks: Array<{ value: string; weight: number }>, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const tokens = tokenizeSearchQuery(query);

  if (!normalizedQuery || tokens.length === 0) {
    return 0;
  }

  let score = 0;

  for (const { value, weight } of haystacks) {
    const normalizedValue = normalizeSearchText(value);
    if (!normalizedValue) {
      continue;
    }

    if (normalizedValue.includes(normalizedQuery)) {
      score += weight * 4;
    }

    for (const token of tokens) {
      if (normalizedValue === token) {
        score += weight * 5;
      } else if (normalizedValue.includes(token)) {
        score += weight;
      }
    }
  }

  return score;
}

export function createQueryHref(basePath: string, params: URLSearchParams | Record<string, string | undefined>) {
  const searchParams = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();

  if (!(params instanceof URLSearchParams)) {
    for (const [key, value] of Object.entries(params)) {
      if (!value) {
        continue;
      }

      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function pageHref(basePath: string, currentParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(currentParams);

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  return createQueryHref(basePath, params);
}
