import Link from "next/link";
import { publicNavigation, siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(7,9,13,0.78)] backdrop-blur-xl">
      <div className="site-shell flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white uppercase"
          aria-label="Kembali ke beranda"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs text-[var(--color-accent)]">
            RC
          </span>
          <span className="hidden sm:inline">{siteConfig.shortName}</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/blog" className="button-secondary hidden sm:inline-flex">
            Baca Blog
          </Link>
          <Link href="/projects" className="button-primary">
            Lihat Project
          </Link>
        </div>
      </div>
    </header>
  );
}
