"use client";

import { useSearchParams } from "next/navigation";

export function ContactStatus() {
  const searchParams = useSearchParams();
  const contact = searchParams.get("contact");
  const message = searchParams.get("message");

  if (contact === "success") {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Pesan berhasil dikirim dan tercatat ke sistem.
      </div>
    );
  }

  if (contact === "error") {
    return (
      <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        {message ?? "Pesan gagal dikirim."}
      </div>
    );
  }

  return null;
}
