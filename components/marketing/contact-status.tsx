"use client";

import { useSearchParams } from "next/navigation";

export function ContactStatus() {
  const searchParams = useSearchParams();
  const contact = searchParams.get("contact");
  const message = searchParams.get("message");

  if (contact === "success") {
    return (
      <div className="site-feedback-card is-success mt-6" role="status" aria-live="polite">
        <p className="site-feedback-title">Pesan terkirim</p>
        <p className="site-feedback-copy">
          Pesan berhasil dikirim dan tercatat ke sistem.
        </p>
      </div>
    );
  }

  if (contact === "error") {
    return (
      <div className="site-feedback-card is-error mt-6" role="alert">
        <p className="site-feedback-title">Pengiriman gagal</p>
        <p className="site-feedback-copy">{message ?? "Pesan gagal dikirim."}</p>
      </div>
    );
  }

  return null;
}
