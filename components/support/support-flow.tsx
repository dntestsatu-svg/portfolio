"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import type { SupportTransactionSnapshot } from "@/lib/support-shared";
import { SUPPORT_EXPIRE_SECONDS, SUPPORT_MIN_AMOUNT } from "@/lib/support-shared";

type GenerateSupportResponse = {
  transaction: SupportTransactionSnapshot;
  qrisImageDataUrl: string;
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

export function SupportFlow() {
  const [amountDigits, setAmountDigits] = useState(String(SUPPORT_MIN_AMOUNT));
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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountValue,
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
              Dukungan sederhana yang langsung masuk ke alur QRIS yang rapi dan aman.
            </h1>
            <p className="copy-muted max-w-2xl text-base md:text-lg">
              Jika tulisan, studi kasus, atau sistem yang saya bangun terasa membantu, Anda bisa
              memberi dukungan secara sukarela. Prosesnya dibuat ringkas, jelas, dan langsung
              diverifikasi melalui webhook.
            </p>
          </div>

          <div className="support-center-shell">
            <article className="surface-panel support-card">
              {phase === "idle" ? (
                <div className="support-card-stack">
                  <div className="support-card-copy">
                    <p className="support-panel-label">Dukungan via QRIS</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                      Masukkan nominal yang ingin Anda kirim.
                    </h2>
                    <p className="copy-muted text-sm md:text-base">
                      Nominal minimum {formatCurrency(SUPPORT_MIN_AMOUNT)}. QR akan aktif selama{" "}
                      {Math.floor(SUPPORT_EXPIRE_SECONDS / 60)} menit setelah dibuat.
                    </p>
                  </div>

                  <form className="support-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <label htmlFor="support-amount" className="text-sm font-medium text-slate-200">
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

                    {errorMessage ? (
                      <div className="support-state-card tone-danger">
                        <p className="support-state-title">Gateway sedang terganggu</p>
                        <p>{errorMessage}</p>
                      </div>
                    ) : null}

                    <div className="support-form-actions">
                      <button type="submit" className="button-primary">
                        Lanjutkan
                      </button>
                      <span className="support-inline-note">Dukungan diproses aman melalui QRIS.</span>
                    </div>
                  </form>
                </div>
              ) : null}

              {phase === "loading" ? (
                <div className="support-card-stack">
                  <div className="support-loading-block">
                    <div className="support-loading-orb" aria-hidden="true" />
                    <div className="space-y-3 text-center">
                      <p className="support-panel-label">Menyiapkan QRIS</p>
                      <h2 className="text-2xl font-semibold text-white">
                        Membuat instruksi pembayaran yang siap dipindai.
                      </h2>
                      <p className="copy-muted text-sm md:text-base">
                        Tunggu sebentar. Sistem sedang meminta QRIS ke gateway dan menyimpan
                        transaksi dukungan Anda secara aman.
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
                        <div>
                          <dt>Referensi</dt>
                          <dd>{displayTransaction.customRef}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>{displayTransaction.statusLabel}</dd>
                        </div>
                      </dl>

                      <div className="support-summary-note">
                        Jangan tutup halaman ini jika Anda ingin melihat perubahan status secara
                        otomatis. Bila QR habis masa berlaku, Anda bisa membuat QR baru tanpa
                        mengulang proses dari awal.
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
                      ini membantu saya menjaga tulisan dan studi kasus di portfolio tetap aktif dan
                      terus berkembang.
                    </p>
                  </div>

                  <div className="support-summary-card">
                    <dl className="support-summary-grid">
                      <div>
                        <dt>Nominal</dt>
                        <dd>{displayTransaction.amountLabel}</dd>
                      </div>
                      <div>
                        <dt>Referensi</dt>
                        <dd>{displayTransaction.customRef}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{displayTransaction.statusLabel}</dd>
                      </div>
                      <div>
                        <dt>QRIS</dt>
                        <dd>{displayTransaction.finishedAtISO ? "Tervalidasi" : "Diproses"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="support-form-actions support-form-actions-center">
                    <button type="button" className="button-primary" onClick={handleReset}>
                      Kirim dukungan lagi
                    </button>
                    <Link href="/blog" className="button-secondary">
                      Kembali ke blog
                    </Link>
                  </div>
                </div>
              ) : null}

              {(phase === "failed" || phase === "expired") && displayTransaction ? (
                <div className="support-card-stack">
                  <div className={`support-confirmation-mark ${phase === "failed" ? "tone-danger" : "tone-muted"}`} aria-hidden="true">
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
                        : "Untuk alasan keamanan, QRIS hanya aktif dalam jangka waktu terbatas. Anda bisa membuat QR baru dengan nominal yang sama."}
                    </p>
                  </div>

                  <div className="support-summary-card">
                    <dl className="support-summary-grid">
                      <div>
                        <dt>Nominal</dt>
                        <dd>{displayTransaction.amountLabel}</dd>
                      </div>
                      <div>
                        <dt>Referensi</dt>
                        <dd>{displayTransaction.customRef}</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>{displayTransaction.statusLabel}</dd>
                      </div>
                      <div>
                        <dt>Durasi</dt>
                        <dd>{Math.floor(SUPPORT_EXPIRE_SECONDS / 60)} menit</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="support-form-actions support-form-actions-center">
                    <button type="button" className="button-primary" onClick={handleReset}>
                      Buat QR baru
                    </button>
                    <Link href="/projects" className="button-secondary">
                      Lihat project
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
