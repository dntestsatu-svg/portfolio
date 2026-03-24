"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Dashboard",
    href: "/admin",
    description: "Ringkasan operasional dan akses cepat.",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    description: "Kelola project, stack, dan status publish.",
  },
  {
    label: "Blog",
    href: "/admin/blog",
    description: "Workspace editorial dan manajemen artikel.",
  },
  {
    label: "Contacts",
    href: "/admin/messages",
    description: "Tinjau pesan masuk dari contact form.",
  },
  {
    label: "Audit",
    href: "/admin/audit",
    description: "Pantau aktivitas admin dan failed login.",
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="admin-nav">
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-nav-link${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="admin-nav-title">{link.label}</span>
            <span className="admin-nav-description">{link.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
