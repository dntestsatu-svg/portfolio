import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CsrfTokenBridge } from "@/components/admin/csrf-token-bridge";
import { CsrfTokenInput } from "@/components/admin/csrf-token-input";
import { StatusAlert } from "@/components/admin/status-alert";
import { getAdminSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Login administrator untuk mengelola project dan artikel.",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const query = await searchParams;

  return (
    <main id="main-content" className="admin-workspace" data-admin-shell="true">
      <CsrfTokenBridge />
      <div className="site-shell max-w-2xl">
        <section className="admin-panel p-6 md:p-8">
          <p className="admin-panel-label">Admin access</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
            Login dashboard admin
          </h1>
          <p className="admin-copy-muted mt-3 max-w-xl text-sm">
            Gunakan kredensial admin untuk mengelola project, blog, dan pesan
            kontak. Session disimpan melalui cookie HttpOnly berbasis JWT.
          </p>

          <div className="mt-5">
            <StatusAlert error={query.error} />
          </div>

          <form action="/api/auth/login" method="post" className="mt-5 grid gap-4">
            <CsrfTokenInput />

            <div className="grid gap-2">
              <label htmlFor="email" className="admin-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="admin-field"
                placeholder="admin@domain.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="admin-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="admin-field"
                placeholder="Password admin"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="admin-button-primary">
              Masuk ke dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
