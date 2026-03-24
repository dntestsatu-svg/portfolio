import Link from "next/link";
import { SupportLeaderboard } from "@/components/support/support-leaderboard";
import type { SupportLeaderboardPage } from "@/lib/support-shared";

type SupportLeaderboardPreviewProps = {
  leaderboard: SupportLeaderboardPage;
};

export function SupportLeaderboardPreview({ leaderboard }: SupportLeaderboardPreviewProps) {
  return (
    <section className="section-space pt-0">
      <div className="site-shell">
        <div className="support-leaderboard-section">
          <div className="support-leaderboard-header">
            <div className="support-card-copy">
              <span className="eyebrow">Apresiasi publik</span>
              <h2 className="section-title max-w-3xl">
                Supporter yang memilih tampil di publik saya tempatkan dengan hormat, bukan dengan
                gaya yang berisik.
              </h2>
              <p className="copy-muted max-w-2xl text-base md:text-lg">
                Ranking ini hanya menghitung dukungan sukses yang benar-benar diizinkan tampil.
                Donatur tetap bisa memilih anonim atau tetap privat.
              </p>
            </div>

            <div className="support-leaderboard-summary-grid">
              <article className="support-leaderboard-summary-card">
                <span>Total supporter</span>
                <strong>{leaderboard.summary.totalSupportersLabel}</strong>
              </article>
              <article className="support-leaderboard-summary-card">
                <span>Total dukungan publik</span>
                <strong>{leaderboard.summary.totalAmountLabel}</strong>
              </article>
              <article className="support-leaderboard-summary-card">
                <span>Dukungan terbaru</span>
                <strong>{leaderboard.summary.latestSupportLabel ?? "Belum ada"}</strong>
              </article>
            </div>
          </div>

          <SupportLeaderboard leaderboard={leaderboard} variant="preview" />

          <div className="support-leaderboard-footer">
            <p className="copy-muted text-sm">
              Ingin melihat seluruh ranking publik? Halaman lengkap menampilkan urutan, total
              nominal, jumlah dukungan sukses, dan tanggal dukungan terakhir.
            </p>
            <Link href="/dukungan/ranking" className="button-secondary">
              Lihat ranking lengkap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
