"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { publicNavigation, siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const mobileMenu =
    typeof document !== "undefined" && isMenuOpen
      ? createPortal(
          <div className="site-mobile-menu-overlay md:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="site-mobile-menu-backdrop"
              aria-label="Tutup menu"
              onClick={() => setIsMenuOpen(false)}
            />
            <div id="site-mobile-menu" className="site-mobile-menu-sheet">
              <div className="site-mobile-menu-header">
                <div className="space-y-2">
                  <span className="eyebrow">Navigasi</span>
                  <h2 className="site-mobile-menu-title">Beri arah yang jelas sebelum lanjut membaca</h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="site-mobile-menu-close"
                  aria-label="Tutup menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tutup
                </button>
              </div>

              <nav aria-label="Navigasi mobile" className="site-mobile-menu-list">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="site-mobile-menu-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.href === "/beri-dukungan" ? (
                      <span className="tag-chip-subtle">QRIS</span>
                    ) : null}
                  </Link>
                ))}
              </nav>

              <div className="site-mobile-menu-footer">
                <p className="copy-muted text-sm">
                  Baca artikel, lihat case study, atau beri dukungan ketika karya ini terasa
                  bermanfaat.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-[70] border-b border-white/8 bg-[rgba(7,9,13,0.78)] backdrop-blur-xl">
        <div className="site-shell flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white uppercase"
            aria-label="Kembali ke beranda"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xs text-(--color-accent)">
              RC
            </span>
            <span className="hidden sm:inline">{siteConfig.shortName}</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === "/beri-dukungan"
                    ? "text-sm text-slate-100 transition hover:text-white"
                    : "text-sm text-slate-300 transition hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="site-mobile-menu-trigger md:hidden"
              aria-expanded={isMenuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setIsMenuOpen(true)}
            >
              Menu
            </button>

            <Link href="/blog" className="button-secondary hidden sm:inline-flex">
              Baca Blog
            </Link>
            <Link href="/projects" className="button-primary">
              Lihat Project
            </Link>
          </div>
        </div>
      </header>

      {mobileMenu}
    </>
  );
}

