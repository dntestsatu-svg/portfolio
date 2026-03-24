import { getContactMessages } from "@/lib/services/content";

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <section className="surface-panel rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-white">Contact messages</h2>
      <p className="copy-muted mt-2 text-sm">
        Pesan yang masuk dari form kontak publik disimpan ke database dan dapat ditinjau dari sini.
      </p>

      <div className="mt-6 grid gap-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-white/8 bg-white/4 p-5">
              <div className="flex flex-wrap gap-2">
                <span className="tag-chip-subtle">{message.status}</span>
                <span className="tag-chip-subtle">{message.email}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{message.subject}</h3>
              <p className="copy-muted mt-2 text-sm">{message.name}</p>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-200">
                {message.message}
              </p>
            </article>
          ))
        ) : (
          <p className="copy-muted text-sm">Belum ada pesan kontak tersimpan.</p>
        )}
      </div>
    </section>
  );
}
