import Link from "next/link";

const links = [
  { label: "Overview", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Audit", href: "/admin/audit" },
];

export function AdminNav() {
  return (
    <nav aria-label="Navigasi admin" className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="button-secondary">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
