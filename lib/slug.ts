const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const HYPHEN_EDGES = /(^-|-$)/g;

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(NON_ALPHANUMERIC, "-")
    .replace(HYPHEN_EDGES, "")
    .slice(0, 80);
}
