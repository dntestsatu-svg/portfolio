import Link from "next/link";
import { publicNavigation, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-black/30">
      <div className="site-shell flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.24em] text-[var(--color-accent)] uppercase">
            {siteConfig.name}
          </p>
          <p className="mt-3 text-lg font-medium text-white">{siteConfig.role}</p>
          <p className="copy-muted mt-3 text-sm">
            Dibangun dengan Next.js App Router, TypeScript, semantic HTML, dan fondasi SEO
            modern untuk menghadirkan portfolio yang cepat, kredibel, dan mudah dikembangkan.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <nav aria-label="Navigasi footer" className="flex flex-wrap gap-4">
            {publicNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-slate-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
