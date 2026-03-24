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
    <main id="main-content" className="section-space">
      <CsrfTokenBridge />
      <div className="site-shell max-w-xl">
        <section className="surface-panel rounded-[2rem] p-8">
          <p className="eyebrow">Admin access</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
            Login dashboard admin
          </h1>
          <p className="copy-muted mt-4 text-sm">
            Gunakan kredensial admin untuk mengelola project, blog, dan pesan
            kontak. Session disimpan melalui cookie HttpOnly berbasis JWT.
          </p>

          <div className="mt-6">
            <StatusAlert error={query.error} />
          </div>

          <form action="/api/auth/login" method="post" className="mt-6 grid gap-5">
            <CsrfTokenInput />

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field-input"
                placeholder="admin@domain.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="field-input"
                placeholder="Password admin"
                required
              />
            </div>

            <button type="submit" className="button-primary">
              Masuk ke dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
