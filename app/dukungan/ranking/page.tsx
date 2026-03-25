import type { Metadata } from "next";
import Link from "next/link";
import { SupportLeaderboard } from "@/components/support/support-leaderboard";
import { SectionHeading } from "@/components/marketing/section-heading";
import { getSupportLeaderboardPage } from "@/lib/services/support";
import {
  getCollectionPageStructuredData,
  toStructuredDataJson,
} from "@/lib/structured-data";

type SupportRankingPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

function sanitizePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateMetadata({
  searchParams,
}: SupportRankingPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const title = page > 1 ? `Ranking Dukungan - Halaman ${page}` : "Ranking Dukungan";
  const description =
    "Leaderboard supporter publik yang menampilkan total dukungan sukses terbesar, jumlah support, dan waktu dukungan terakhir secara elegan dan transparan.";
  const canonical = page > 1 ? `/dukungan/ranking?page=${page}` : "/dukungan/ranking";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} | Mugiew Castello`,
      description,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Mugiew Castello`,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function SupportRankingPage({ searchParams }: SupportRankingPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = sanitizePage(resolvedSearchParams.page);
  const leaderboard = await getSupportLeaderboardPage(page);
  const structuredData = toStructuredDataJson(
    getCollectionPageStructuredData({
      path: page > 1 ? `/dukungan/ranking?page=${leaderboard.page}` : "/dukungan/ranking",
      title: "Ranking Dukungan | Mugiew Castello",
      description:
        "Halaman apresiasi publik untuk supporter yang telah memberikan dukungan sukses dan memilih tampil di leaderboard.",
    }),
  );

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-10">
        <section className="content-shell">
          <div className="content-main-column space-y-8">
            <SectionHeading
              eyebrow="Support leaderboard"
              title="Ruang apresiasi publik untuk supporter yang memilih tampil dengan elegan."
              description="Ranking dihitung hanya dari transaksi dukungan yang sukses dan memang diizinkan tampil. Urutannya memakai total nominal terbesar, lalu jumlah support sukses, lalu dukungan terakhir yang paling baru."
            />

            <div className="support-leaderboard-summary-grid">
              <article className="support-leaderboard-summary-card">
                <span>Total supporter publik</span>
                <strong>{leaderboard.summary.totalSupportersLabel}</strong>
              </article>
              <article className="support-leaderboard-summary-card">
                <span>Total dukungan sukses</span>
                <strong>{leaderboard.summary.totalAmountLabel}</strong>
              </article>
              <article className="support-leaderboard-summary-card">
                <span>Dukungan terakhir</span>
                <strong>{leaderboard.summary.latestSupportLabel ?? "Belum ada"}</strong>
              </article>
            </div>

            <SupportLeaderboard leaderboard={leaderboard} variant="page" />
          </div>

          <aside className="content-sidebar-column">
            <div className="content-sidebar-stack is-sticky">
              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Cara ranking dihitung</h2>
                <div className="space-y-3 text-sm text-slate-300">
                  <p>Hanya transaksi dengan status sukses yang dihitung.</p>
                  <p>Support privat tidak akan pernah masuk ke leaderboard publik.</p>
                  <p>Jika donor memilih anonim, namanya tetap disamarkan sebagai Anonim.</p>
                </div>
              </section>

              <section className="content-sidebar-card">
                <h2 className="content-sidebar-title">Ingin ikut tampil?</h2>
                <p className="copy-muted text-sm">
                  Saat memberi dukungan, Anda bisa memilih salah satu dari tiga mode: tampil dengan
                  nama, tampil anonim, atau tetap privat.
                </p>
                <div className="mt-4">
                  <Link href="/beri-dukungan" className="button-primary">
                    Buka halaman dukungan
                  </Link>
                </div>
              </section>
            </div>
          </aside>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
    </main>
  );
}
