import Link from "next/link";

type SupportContextCtaProps = {
  context: "blog" | "project";
  layout: "sidebar" | "inline";
};

const copyByContext = {
  blog: {
    eyebrow: "Apresiasi pembaca",
    title: "Dukung karya saya",
    description:
      "Jika artikel ini membantu Anda berpikir lebih cepat atau lebih jelas, Anda bisa memberi dukungan via QRIS secara sukarela. Tersedia opsi anonim dan mode publik yang tetap elegan.",
  },
  project: {
    eyebrow: "Apresiasi case study",
    title: "Dukung karya saya",
    description:
      "Jika studi kasus atau sistem ini terasa bermanfaat, Anda bisa memberi dukungan via QRIS secara ringkas. Flow-nya tetap sopan, tidak mengganggu, dan mendukung opsi anonim.",
  },
} as const;

export function SupportContextCta({ context, layout }: SupportContextCtaProps) {
  const copy = copyByContext[context];
  const className =
    layout === "sidebar"
      ? "content-sidebar-card support-context-card"
      : "surface-panel rounded-4xl p-5 support-context-card";

  return (
    <section className={className}>
      <div className="support-context-copy">
        <p className="support-panel-label">{copy.eyebrow}</p>
        <h2 className="support-context-title">{copy.title}</h2>
        <p className="copy-muted text-sm">{copy.description}</p>
      </div>

      <div className="support-context-actions">
        <Link href="/beri-dukungan" className="button-primary">
          Beri Dukungan
        </Link>
        <p className="support-context-note">
          Dukungan diproses aman via QRIS, dan hanya tampil publik jika Anda memilihnya.
        </p>
      </div>
    </section>
  );
}
