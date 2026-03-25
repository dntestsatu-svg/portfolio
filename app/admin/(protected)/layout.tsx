import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { CsrfTokenBridge } from "@/components/admin/csrf-token-bridge";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { requireAdminSession } from "@/lib/auth/session";
import { hasDatabaseConfig } from "@/lib/env";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <main id="main-content" className="admin-workspace" data-admin-shell="true">
      <CsrfTokenBridge />
      <div className="site-shell">
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <section className="admin-sidebar-panel">
              <Link href="/admin" className="admin-brand" aria-label="Kembali ke dashboard admin">
                <span className="admin-brand-mark">MN</span>
                <span>
                  <span className="admin-panel-label">Admin workspace</span>
                  <span className="mt-2 block text-base font-semibold text-white">
                    Portfolio control room
                  </span>
                </span>
              </Link>

              <p className="admin-sidebar-copy mt-4 text-sm">
                Ruang kerja internal untuk mengelola project, artikel, pesan, dan jejak audit
                dengan fokus pada kecepatan operasional.
              </p>

              <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                <p className="admin-panel-label">Session aktif</p>
                <p className="mt-2 text-sm font-medium text-white">{session.email}</p>
                <p className="admin-help mt-1">
                  Cookie JWT dan CSRF validation tetap aktif pada seluruh operasi admin.
                </p>
              </div>
            </section>

            {!hasDatabaseConfig ? (
              <section className="admin-sidebar-panel border-amber-400/25 bg-amber-500/8">
                <p className="admin-panel-label text-amber-200">Database</p>
                <p className="mt-2 text-sm text-amber-100">
                  DATABASE_URL belum diisi. Operasi CRUD akan gagal sampai koneksi MySQL tersedia.
                </p>
              </section>
            ) : null}

            <section className="admin-sidebar-panel">
              <p className="admin-panel-label">Navigasi</p>
              <div className="mt-3">
                <AdminNav />
              </div>
            </section>

            <section className="admin-sidebar-panel">
              <p className="admin-panel-label">Session control</p>
              <form action="/api/auth/logout" method="post" className="mt-3">
                <CsrfTokenInput />
                <button type="submit" className="admin-button-secondary admin-button-block">
                  Logout
                </button>
              </form>
            </section>
          </aside>

          <div className="admin-content">{children}</div>
        </div>
      </div>
    </main>
  );
}
