import Link from "next/link";
import { Pagination } from "@/components/content/pagination";
import { pageHref } from "@/lib/services/discovery-utils";
import type { SupportLeaderboardPage } from "@/lib/support-shared";

type SupportLeaderboardProps = {
  leaderboard: SupportLeaderboardPage;
  variant: "preview" | "page";
};

function SupportLeaderboardEmptyState({ variant }: { variant: "preview" | "page" }) {
  return (
    <section className="support-leaderboard-empty surface-panel">
      <p className="support-panel-label">Belum ada ranking publik</p>
      <h2>
        {variant === "preview"
          ? "Belum ada supporter yang memilih tampil di ranking."
          : "Leaderboard akan tampil saat ada dukungan publik yang sudah terverifikasi."}
      </h2>
      <p>
        Dukungan pertama tetap bisa tampil secara elegan tanpa membuka identitas. Pengunjung dapat
        memilih tampil anonim atau menyimpan dukungannya secara privat.
      </p>
      <div className="content-empty-actions">
        <Link href="/beri-dukungan" className="button-primary">
          Beri dukungan
        </Link>
        {variant === "preview" ? (
          <Link href="/dukungan/ranking" className="button-secondary">
            Halaman ranking
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function SupportRankingRow({
  entry,
}: {
  entry: SupportLeaderboardPage["entries"][number];
}) {
  return (
    <article className="support-ranking-row">
      <div className="support-ranking-rank">{String(entry.rank).padStart(2, "0")}</div>
      <div className="support-ranking-copy">
        <div className="support-ranking-heading">
          <h3>{entry.displayName}</h3>
          {entry.isAnonymous ? <span className="tag-chip-subtle">Anonim</span> : null}
        </div>
        <p className="support-ranking-meta">
          {entry.supportCount} dukungan sukses · terakhir {entry.lastSupportLabel}
        </p>
      </div>
      <dl className="support-ranking-stats">
        <div>
          <dt>Total dukungan</dt>
          <dd>{entry.totalAmountLabel}</dd>
        </div>
        <div>
          <dt>Jumlah support</dt>
          <dd>{entry.supportCount}</dd>
        </div>
      </dl>
    </article>
  );
}

function SupportPodiumCard({
  entry,
  tone,
}: {
  entry: SupportLeaderboardPage["entries"][number];
  tone: "gold" | "silver" | "bronze";
}) {
  return (
    <article className={`support-podium-card is-${tone}`}>
      <div className="support-podium-rank">#{entry.rank}</div>
      <div className="support-podium-copy">
        <div className="support-ranking-heading">
          <h3>{entry.displayName}</h3>
          {entry.isAnonymous ? <span className="tag-chip-subtle">Anonim</span> : null}
        </div>
        <p className="support-ranking-meta">
          {entry.supportCount} dukungan sukses · terakhir {entry.lastSupportLabel}
        </p>
      </div>
      <div className="support-podium-amount">{entry.totalAmountLabel}</div>
    </article>
  );
}

export function SupportLeaderboard({ leaderboard, variant }: SupportLeaderboardProps) {
  if (leaderboard.entries.length === 0) {
    return <SupportLeaderboardEmptyState variant={variant} />;
  }

  const showPodium = leaderboard.page === 1;
  const podiumEntries = showPodium ? leaderboard.entries.slice(0, 3) : [];
  const listEntries = showPodium ? leaderboard.entries.slice(3) : leaderboard.entries;

  const pageLinks = Array.from({ length: leaderboard.totalPages }, (_, index) => {
    const targetPage = index + 1;
    return {
      page: targetPage,
      href: pageHref("/dukungan/ranking", new URLSearchParams(), targetPage),
      current: targetPage === leaderboard.page,
    };
  });

  return (
    <div className="support-leaderboard-stack">
      {podiumEntries.length > 0 ? (
        <div className="support-podium-grid">
          {podiumEntries[0] ? <SupportPodiumCard entry={podiumEntries[0]} tone="gold" /> : null}
          {podiumEntries[1] ? <SupportPodiumCard entry={podiumEntries[1]} tone="silver" /> : null}
          {podiumEntries[2] ? <SupportPodiumCard entry={podiumEntries[2]} tone="bronze" /> : null}
        </div>
      ) : null}

      {listEntries.length > 0 ? (
        <div className="support-ranking-list">
          {listEntries.map((entry) => (
            <SupportRankingRow key={`${entry.rank}-${entry.displayName}`} entry={entry} />
          ))}
        </div>
      ) : null}

      {variant === "page" && leaderboard.totalPages > 1 ? (
        <Pagination
          summary={`Halaman ${leaderboard.page} dari ${leaderboard.totalPages} · ${leaderboard.totalEntries} supporter publik`}
          previousHref={
            leaderboard.page > 1
              ? pageHref("/dukungan/ranking", new URLSearchParams(), leaderboard.page - 1)
              : null
          }
          nextHref={
            leaderboard.page < leaderboard.totalPages
              ? pageHref("/dukungan/ranking", new URLSearchParams(), leaderboard.page + 1)
              : null
          }
          links={pageLinks}
        />
      ) : null}
    </div>
  );
}
