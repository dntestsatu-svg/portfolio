import type { ReactNode } from "react";
import type { Metadata } from "next";
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
    <main id="main-content" className="section-space">
      <CsrfTokenBridge />
      <div className="site-shell space-y-6">
        <section className="surface-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
                Kontrol konten portfolio
              </h1>
              <p className="copy-muted mt-3 text-sm">
                Login sebagai {session.email}. Dashboard ini dilindungi cookie
                session berbasis JWT dan verifikasi server-side pada route admin
                maupun API.
              </p>
            </div>

            <form action="/api/auth/logout" method="post">
              <CsrfTokenInput />
              <button type="submit" className="button-secondary">
                Logout
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {!hasDatabaseConfig ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                DATABASE_URL belum diisi. Data dashboard tidak dapat dimuat
                secara penuh dan operasi CRUD akan gagal sampai koneksi MySQL
                tersedia.
              </div>
            ) : null}
            <AdminNav />
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
