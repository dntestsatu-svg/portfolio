import Link from "next/link";
import { getContactMessages } from "@/lib/services/content";

function formatMessageDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();
  const unreadCount = messages.filter((message) => message.status === "unread").length;
  const readCount = messages.length - unreadCount;

  return (
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Inbox workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Tinjau pesan kontak
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Halaman ini bersifat read-only dan dipakai untuk meninjau pesan yang masuk dari form
            kontak publik. Fokus utamanya adalah membantu admin memindai subject, pengirim, dan isi
            pesan dengan cepat.
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/#contact" className="admin-button-ghost">
            Buka form publik
          </Link>
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-panel-label">Total pesan</span>
          <strong className="admin-stat-value">{messages.length}</strong>
          <span className="admin-help">Semua pesan yang tersimpan di inbox.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Unread</span>
          <strong className="admin-stat-value">{unreadCount}</strong>
          <span className="admin-help">Masih perlu ditinjau lebih lanjut.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Read</span>
          <strong className="admin-stat-value">{readCount}</strong>
          <span className="admin-help">Sudah masuk status terbaca di database.</span>
        </article>
      </section>

      {messages.length > 0 ? (
        <section className="admin-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-panel-label">Message list</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Inbox</h2>
            </div>
            <p className="admin-help">
              Tampilan ini belum mengubah status pesan. Tujuannya tetap read-only dan aman.
            </p>
          </div>

          <div className="admin-list mt-4">
            {messages.map((message) => (
              <article key={message.id} className="admin-list-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`admin-status-chip${message.status === "unread" ? " is-draft" : " is-published"}`}
                    >
                      {message.status}
                    </span>
                    <span className="admin-meta-chip">{message.email}</span>
                    <span className="admin-meta-chip">{formatMessageDate(message.createdAt)}</span>
                  </div>

                  <h3 className="admin-list-title mt-3">{message.subject}</h3>
                  <p className="admin-list-summary mt-2">Dari {message.name}</p>
                  <div className="admin-message-body mt-4">{message.message}</div>
                </div>

                <div className="admin-row-actions">
                  <a
                    href={`mailto:${message.email}?subject=Re:%20${encodeURIComponent(message.subject)}`}
                    className="admin-button-secondary"
                  >
                    Balas email
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-empty-state">
          <p className="admin-panel-label">Inbox kosong</p>
          <h2 className="text-2xl font-semibold text-white">Belum ada pesan kontak</h2>
          <p className="admin-copy-muted max-w-2xl text-sm">
            Pesan dari halaman publik akan muncul di sini. Empty state ini berarti inbox masih
            bersih dan belum ada submission yang masuk.
          </p>
          <ul className="admin-hint-list">
            <li>Pastikan form kontak publik aktif dan env email tampil dengan benar.</li>
            <li>Pesan yang lolos validasi serta rate limit akan otomatis tersimpan di database.</li>
          </ul>
        </section>
      )}
    </section>
  );
}
