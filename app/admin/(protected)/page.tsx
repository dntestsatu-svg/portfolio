import Link from "next/link";
import { getDashboardSummary } from "@/lib/services/content";

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <section className="grid gap-5 md:grid-cols-3">
      <article className="surface-panel rounded-4xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Projects</p>
        <p className="mt-4 text-4xl font-semibold text-white">{summary.projectCount}</p>
        <p className="copy-muted mt-3 text-sm">Total item project tersimpan di database.</p>
      </article>

      <article className="surface-panel rounded-4xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Articles</p>
        <p className="mt-4 text-4xl font-semibold text-white">{summary.articleCount}</p>
        <p className="copy-muted mt-3 text-sm">Konten blog dan tutorial yang siap dipublikasikan.</p>
      </article>

      <article className="surface-panel rounded-4xl p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Unread messages</p>
        <p className="mt-4 text-4xl font-semibold text-white">{summary.unreadContactCount}</p>
        <p className="copy-muted mt-3 text-sm">Pesan kontak yang belum ditindaklanjuti.</p>
      </article>

      <article className="surface-panel rounded-4xl p-6 md:col-span-3">
        <h2 className="text-2xl font-semibold text-white">Quick actions</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/projects" className="button-primary">
            Kelola project
          </Link>
          <Link href="/admin/blog" className="button-secondary">
            Kelola blog
          </Link>
          <Link href="/admin/messages" className="button-secondary">
            Lihat pesan
          </Link>
          <Link href="/admin/audit" className="button-secondary">
            Tinjau audit log
          </Link>
        </div>
      </article>
    </section>
  );
}

