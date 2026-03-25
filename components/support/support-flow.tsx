"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import type {
  SupportLeaderboardSummary,
  SupportTransactionSnapshot,
} from "@/lib/support-shared";
import { SUPPORT_EXPIRE_SECONDS, SUPPORT_MIN_AMOUNT } from "@/lib/support-shared";

type GenerateSupportResponse = {
  transaction: SupportTransactionSnapshot;
  qrisImageDataUrl: string;
};

type SupportFlowProps = {
  leaderboardSummary?: SupportLeaderboardSummary;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(Math.ceil(remainingMs / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatAmountInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return `Rp${new Intl.NumberFormat("id-ID").format(Number(digits))}`;
}

function deriveDisplayTransaction(
  transaction: SupportTransactionSnapshot | null,
  remainingMs: number,
) {
  if (!transaction) {
    return null;
  }

  if (transaction.status === "pending" && remainingMs <= 0) {
    return {
      ...transaction,
      status: "expired" as const,
      statusLabel: "QRIS kedaluwarsa",
      statusTone: "muted" as const,
      isExpired: true,
    };
  }

  return transaction;
}

function getVisibilityLabel(transaction: SupportTransactionSnapshot | null) {
  if (!transaction) {
    return "Privat";
  }

  if (!transaction.donor.showOnLeaderboard) {
    return "Privat";
  }

  return transaction.donor.isAnonymous ? "Publik · Anonim" : "Publik · Nama tampil";
}

function getVisibilityDescription(options: {
  showOnLeaderboard: boolean;
  isAnonymous: boolean;
  supporterName: string;
}) {
  if (!options.showOnLeaderboard) {
    return "Dukungan ini tetap privat dan tidak masuk ke leaderboard publik.";
  }

  if (options.isAnonymous) {
    return "Dukungan akan masuk ke ranking publik sebagai Anonim setelah pembayaran sukses.";
  }

  return `Nama ${options.supporterName || "Anda"} akan tampil di ranking publik setelah pembayaran sukses.`;
}

export function SupportFlow({ leaderboardSummary }: SupportFlowProps) {
  const [amountDigits, setAmountDigits] = useState(String(SUPPORT_MIN_AMOUNT));
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [transaction, setTransaction] = useState<SupportTransactionSnapshot | null>(null);
  const [qrisImageDataUrl, setQrisImageDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const amountValue = Number(amountDigits || "0");
  const expiresAtMs = transaction ? new Date(transaction.expiresAtISO).getTime() : 0;
  const remainingMs = transaction ? Math.max(expiresAtMs - now, 0) : 0;
  const displayTransaction = deriveDisplayTransaction(transaction, remainingMs);
  const formattedAmountInput = formatAmountInput(amountDigits);
  const countdownLabel = formatCountdown(remainingMs);
  const messageLength = message.trim().length;
  const visibilityDescription = getVisibilityDescription({
    showOnLeaderboard,
    isAnonymous,
    supporterName: supporterName.trim(),
  });
  const hasPublicSupporters = Boolean(leaderboardSummary && leaderboardSummary.totalSupporters > 0);

  const phase = isSubmitting
    ? "loading"
    : !displayTransaction
      ? "idle"
      : displayTransaction.status === "success"
        ? "success"
        : displayTransaction.status === "failed"
          ? "failed"
          : displayTransaction.status === "expired"
            ? "expired"
            : "generated";

  const pollStatus = useEffectEvent(async () => {
    if (!transaction || transaction.status !== "pending") {
      return;
    }

    try {
      const response = await fetch(`/api/support/${transaction.customRef}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const nextTransaction = (await response.json()) as SupportTransactionSnapshot;
      setTransaction(nextTransaction);
    } catch {
      // Keep the current screen stable while the next polling cycle retries.
    }
  });

  useEffect(() => {
    if (!transaction || transaction.status !== "pending") {
      return;
    }

    const tick = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(tick);
  }, [transaction]);

  useEffect(() => {
    if (!transaction || transaction.status !== "pending") {
      return;
    }

    const poll = window.setInterval(() => {
      void pollStatus();
    }, 5000);

    return () => window.clearInterval(poll);
  }, [transaction]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (amountValue < SUPPORT_MIN_AMOUNT) {
      setErrorMessage(`Nominal minimal ${formatCurrency(SUPPORT_MIN_AMOUNT)}.`);
      return;
    }

    if (supporterName.trim().length < 2) {
      setErrorMessage("Nama tampilan minimal 2 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
          supporterName,
          isAnonymous,
          message,
          showOnLeaderboard,
        }),
      });

      const payload = (await response.json()) as GenerateSupportResponse | { error?: string };

      if (!response.ok || !("transaction" in payload)) {
        setTransaction(null);
        setQrisImageDataUrl(null);
        setErrorMessage(
          "error" in payload && payload.error
            ? payload.error
            : "Gateway QRIS sedang mengalami gangguan. Silakan coba lagi beberapa saat lagi.",
        );
        return;
      }

      setTransaction(payload.transaction);
      setQrisImageDataUrl(payload.qrisImageDataUrl);
      setNow(Date.now());
    } catch {
      setTransaction(null);
      setQrisImageDataUrl(null);
      setErrorMessage(
        "Koneksi ke gateway dukungan sedang bermasalah. Coba lagi dalam beberapa saat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setTransaction(null);
    setQrisImageDataUrl(null);
    setErrorMessage(null);
    setNow(Date.now());
  }

  return (
    <section className="section-space pt-16 md:pt-24">
      <div className="site-shell">
        <div className="support-shell">
          <div className="support-header">
            <span className="eyebrow">Beri dukungan</span>
            <h1 className="section-title max-w-3xl">
              Dukungan sukarela yang diproses rapi, jelas, dan cukup sopan untuk dipublikasikan bila
              Anda mengizinkannya.
            </h1>
            <p className="copy-muted max-w-2xl text-base md:text-lg">
              Jika tulisan, studi kasus, atau sistem yang saya bangun terasa membantu, Anda bisa
              memberi dukungan via QRIS. Nama Anda hanya tampil di leaderboard jika Anda memilihnya.
            </p>

            {leaderboardSummary ? (
              <div className="support-proof-grid">
                <article className="support-proof-card">
                  <span>Supporter publik</span>
                  <strong>{leaderboardSummary.totalSupportersLabel}</strong>
                </article>
                <article className="support-proof-card">
                  <span>Total dukungan sukses</span>
                  <strong>{leaderboardSummary.totalAmountLabel}</strong>
                </article>
                <article className="support-proof-card">
                  <span>Dukungan terakhir</span>
                  <strong>{leaderboardSummary.latestSupportLabel ?? "Belum ada"}</strong>
                </article>
              </div>
            ) : null}

            <div className="support-soft-prompt">
              <p>
                {hasPublicSupporters
                  ? "Supporter yang memilih tampil akan masuk ke leaderboard publik secara elegan setelah pembayaran sukses."
                  : "Belum banyak supporter yang memilih tampil publik. Jika karya ini terasa membantu, Anda bisa menjadi salah satu pendukung awal tanpa harus kehilangan opsi anonim atau tetap privat."}
              </p>
            </div>
          </div>

          <div className="support-center-shell">
            <article className="surface-panel support-card">
              {phase === "idle" ? (
                <div className="support-card-stack">
                  <div className="support-card-copy">
                    <p className="support-panel-label">Dukungan via QRIS</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      Atur nominal, nama tampilan, dan preferensi publik Anda.
                    </h2>
                    <p className="copy-muted text-sm md:text-base">
                      Nominal minimum {formatCurrency(SUPPORT_MIN_AMOUNT)}. QR aktif selama{" "}
                      {Math.floor(SUPPORT_EXPIRE_SECONDS / 60)} menit setelah dibuat.
                    </p>
                  </div>

                  <form className="support-form" aria-busy={isSubmitting} onSubmit={handleSubmit}>
                    <div className="support-form-grid">
                      <div className="grid gap-2">
                        <label
                          htmlFor="support-amount"
                          className="text-sm font-medium text-slate-200"
                        >
                          Nominal dukungan
                        </label>
                        <input
                          id="support-amount"
                          name="amount"
                          inputMode="numeric"
                          autoComplete="off"
                          className="field-input support-amount-input"
                          placeholder="Rp10.000"
                          value={formattedAmountInput}
                          onChange={(event) => {
                            setAmountDigits(event.target.value.replace(/\D/g, ""));
                          }}
                          aria-describedby="support-amount-note"
                        />
                        <p id="support-amount-note" className="copy-muted text-sm">
                          Sistem hanya menerima nominal bulat dalam rupiah. Tidak ada biaya tambahan
                          dari sisi aplikasi ini.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor="support-name"
                          className="text-sm font-medium text-slate-200"
                        >
                          Nama tampilan
                        </label>
                        <input
                          id="support-name"
                          name="supporterName"
                          autoComplete="name"
                          maxLength={60}
                          className="field-input"
                          placeholder="Mis. Mugiew Supporter"
                          value={supporterName}
                          onChange={(event) => setSupporterName(event.target.value)}
                        />
                        <p className="copy-muted text-sm">
                          Dipakai untuk apresiasi publik hanya jika Anda memilih tampil di ranking.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="support-message" className="text-sm font-medium text-slate-200">
                        Pesan singkat dukungan <span className="text-slate-500">(opsional)</span>
                      </label>
                      <textarea
                        id="support-message"
                        name="message"
                        rows={3}
                        maxLength={180}
                        className="field-input support-message-input"
                        placeholder="Terima kasih, saya menikmati tulisan dan studi kasus yang Anda bagikan."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                      />
                      <div className="support-inline-meta">
                        <p className="copy-muted text-sm">
                          Pesan disimpan bersama transaksi dukungan, tetapi belum ditampilkan di
                          leaderboard publik.
                        </p>
                        <span>{messageLength}/180</span>
                      </div>
                    </div>

                    <div className="support-preference-stack">
                      <label className="support-checkbox-card">
                        <input
                          type="checkbox"
                          checked={showOnLeaderboard}
                          onChange={(event) => setShowOnLeaderboard(event.target.checked)}
                        />
                        <span>
                          <strong>Tampilkan di leaderboard publik</strong>
                          <small>
                            Hanya transaksi sukses yang akan masuk ke ranking dukungan publik.
                          </small>
                        </span>
                      </label>

                      <label className="support-checkbox-card">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(event) => setIsAnonymous(event.target.checked)}
                        />
                        <span>
                          <strong>Tampilkan sebagai anonim</strong>
                          <small>
                            Jika diaktifkan, ranking publik hanya akan menampilkan label Anonim.
                          </small>
                        </span>
                      </label>
                    </div>

                    <div className="support-privacy-card">
                      <p className="support-state-title">Mode publik saat ini</p>
                      <p>{visibilityDescription}</p>
                    </div>

                    {errorMessage ? (
                      <div className="support-state-card tone-danger" role="alert">
                        <p className="support-state-title">Gateway sedang terganggu</p>
                        <p>{errorMessage}</p>
                      </div>
                    ) : null}

                    <div className="support-form-actions">
                      <button type="submit" className="button-primary">
                        Lanjutkan
                      </button>
                      <Link href="/dukungan/ranking" className="button-secondary">
                        Lihat ranking dukungan
                      </Link>
                      <span className="support-inline-note">
                        Dukungan diproses aman melalui QRIS dan diverifikasi via webhook.
                      </span>
                    </div>
                  </form>
                </div>
              ) : null}

              {phase === "loading" ? (
                <div className="support-card-stack">
                  <div className="support-loading-block" role="status" aria-live="polite">
                    <div className="support-loading-orb" aria-hidden="true" />
                    <div className="space-y-3 text-center">
                      <p className="support-panel-label">Menyiapkan QRIS</p>
                      <h2 className="text-2xl font-semibold text-white">
                        Membuat instruksi pembayaran yang siap dipindai.
                      </h2>
                      <p className="copy-muted text-sm md:text-base">
                        Tunggu sebentar. Sistem sedang meminta QRIS ke gateway dan menyimpan
                        preferensi dukungan Anda secara aman.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {phase === "generated" && displayTransaction ? (
                <div className="support-card-stack">
                  <div className="support-state-hero">
                    <div className="support-card-copy">
                      <p className="support-panel-label">QR siap dibayar</p>
                      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        Scan QRIS ini dari mobile banking atau e-wallet Anda.
                      </h2>
                      <p className="copy-muted text-sm md:text-base">
                        Status akan berubah otomatis setelah pembayaran diterima dan webhook masuk ke
                        sistem.
                      </p>
                    </div>
                    <div className="support-status-pill tone-accent">
                      {displayTransaction.statusLabel}
                    </div>
                  </div>

                  <div className="support-qr-layout">
                    <div className="support-qr-frame">
                      {qrisImageDataUrl ? (
                        <Image
                          src={qrisImageDataUrl}
                          alt={`QRIS dukungan ${displayTransaction.amountLabel}`}
                          className="support-qr-image"
                          width={720}
                          height={720}
                          unoptimized
                        />
                      ) : (
                        <div className="support-qr-fallback">QRIS belum tersedia.</div>
                      )}
                    </div>

                    <div className="support-summary-card">
                      <dl className="support-summary-grid">
                        <div>
                          <dt>Nominal</dt>
                          <dd>{displayTransaction.amountLabel}</dd>
                        </div>
                        <div>
                          <dt>Kedaluwarsa</dt>
                          <dd>{countdownLabel}</dd>
                        </div>
                        <div className="support-summary-item-reference">
                          <dt>Referensi</dt>
                          <dd
                            className="support-summary-reference"
                            title={displayTransaction.customRef}
                          >
                            {displayTransaction.customRef}
                          </dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{displayTransaction.statusLabel}</dd>
                        </div>
                        <div>
                          <dt>Nama tampil</dt>
                          <dd>{displayTransaction.donor.displayName}</dd>
                        </div>
                        <div>
                          <dt>Mode publik</dt>
                          <dd>{getVisibilityLabel(displayTransaction)}</dd>
                        </div>
                      </dl>

                      <div className="support-summary-note">
                        Jangan tutup halaman ini jika Anda ingin melihat perubahan status secara
                        otomatis. Bila QR habis masa berlaku, Anda bisa membuat QR baru tanpa
                        mengulang preferensi donatur dari awal.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {phase === "success" && displayTransaction ? (
                <div className="support-card-stack">
                  <div className="support-confirmation-mark tone-success" aria-hidden="true">
                    ✓
                  </div>
                  <div className="support-card-copy text-center">
                    <p className="support-panel-label">Pembayaran berhasil</p>
                    <h2 className="text-2xl font-semibold text-white md:text-3xl">
                      Terima kasih atas dukungannya.
                    </h2>
                    <p className="copy-muted text-sm md:text-base">
                      Dukungan sebesar {displayTransaction.amountLabel} sudah terkonfirmasi. Apresiasi
                      ini membantu saya menjaga tulisan, studi kasus, dan sistem portfolio tetap aktif
                      dan terus berkembang.
                    </p>
                  </div>

                  <div className="support-summary-card">
                    <dl className="support-summary-grid">
                      <div>
                        <dt>Nominal</dt>
                        <dd>{displayTransaction.amountLabel}</dd>
                      </div>
                      <div className="support-summary-item-reference">
                        <dt>Referensi</dt>
                        <dd
                          className="support-summary-reference"
                          title={displayTransaction.customRef}
                        >
                          {displayTransaction.customRef}
                        </dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{displayTransaction.statusLabel}</dd>
                      </div>
                      <div>
                        <dt>Mode publik</dt>
                        <dd>{getVisibilityLabel(displayTransaction)}</dd>
                      </div>
                    </dl>

                    <div className="support-summary-note">
                      {displayTransaction.donor.showOnLeaderboard
                        ? displayTransaction.donor.isAnonymous
                          ? "Dukungan ini akan masuk ke ranking publik sebagai Anonim setelah status sukses tercatat."
                          : `Dukungan ini akan masuk ke ranking publik atas nama ${displayTransaction.donor.displayName}.`
                        : "Dukungan ini tetap tersimpan privat dan tidak akan tampil di leaderboard publik."}
                    </div>
                  </div>

                  <div className="support-form-actions support-form-actions-center">
                    <button type="button" className="button-primary" onClick={handleReset}>
                      Kirim dukungan lagi
                    </button>
                    <Link href="/dukungan/ranking" className="button-secondary">
                      Lihat ranking dukungan
                    </Link>
                  </div>
                </div>
              ) : null}

              {(phase === "failed" || phase === "expired") && displayTransaction ? (
                <div className="support-card-stack">
                  <div
                    className={`support-confirmation-mark ${phase === "failed" ? "tone-danger" : "tone-muted"}`}
                    aria-hidden="true"
                  >
                    {phase === "failed" ? "!" : "×"}
                  </div>
                  <div className="support-card-copy text-center">
                    <p className="support-panel-label">
                      {phase === "failed" ? "Pembayaran gagal" : "QRIS berakhir"}
                    </p>
                    <h2 className="text-2xl font-semibold text-white md:text-3xl">
                      {phase === "failed"
                        ? "Pembayaran belum bisa diselesaikan."
                        : "Kode QR ini sudah tidak aktif."}
                    </h2>
                    <p className="copy-muted text-sm md:text-base">
                      {phase === "failed"
                        ? "Silakan buat QR baru bila Anda masih ingin melanjutkan dukungan. Jika saldo atau kanal pembayaran sedang bermasalah, coba beberapa saat lagi."
                        : "Untuk alasan keamanan, QRIS hanya aktif dalam jangka waktu terbatas. Anda bisa membuat QR baru dengan nominal dan preferensi publik yang sama."}
                    </p>
                  </div>

                  <div className="support-summary-card">
                    <dl className="support-summary-grid">
                      <div>
                        <dt>Nominal</dt>
                        <dd>{displayTransaction.amountLabel}</dd>
                      </div>
                      <div className="support-summary-item-reference">
                        <dt>Referensi</dt>
                        <dd
                          className="support-summary-reference"
                          title={displayTransaction.customRef}
                        >
                          {displayTransaction.customRef}
                        </dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{displayTransaction.statusLabel}</dd>
                      </div>
                      <div>
                        <dt>Mode publik</dt>
                        <dd>{getVisibilityLabel(displayTransaction)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="support-form-actions support-form-actions-center">
                    <button type="button" className="button-primary" onClick={handleReset}>
                      Buat QR baru
                    </button>
                    <Link href="/dukungan/ranking" className="button-secondary">
                      Lihat ranking dukungan
                    </Link>
                  </div>
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
