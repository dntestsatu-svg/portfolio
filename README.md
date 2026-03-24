This is a [Next.js](https://nextjs.org) project configured to run with [Bun](https://bun.sh).

## Getting Started

First, run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Useful commands:

```bash
bun run lint
bun run test
bun run build
bun run prisma:generate -- --config prisma.config.ts
bun run db:push -- --config prisma.config.ts
bun run db:seed
bun run audit:prune:dry-run
bun run audit:prune
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Audit Operations

Audit log memiliki lifecycle operasional yang dibatasi:

- Retention default `90` hari melalui `AUDIT_LOG_RETENTION_DAYS`
- Failed-login alert threshold default `10` event dalam `15` menit
- Export audit dibatasi maksimal `500` baris dan `31` hari per request
- Pruning dijalankan terpisah melalui `bun run audit:prune` agar surface area admin tetap kecil

Praktik yang dipakai:

- Failed-login identifier disimpan dalam bentuk masked display + hash korelasi
- Export admin hanya memuat subset field yang aman, bukan payload mentah
- Archive dilakukan dengan pola `export terlebih dahulu`, lalu pruning terjadwal

## Scheduler Setup

Retention audit log tidak berjalan otomatis dari UI admin. Jalankan pruning sebagai job terjadwal terpisah:

```bash
bun run audit:prune:dry-run
bun run audit:prune
```

Urutan operasional yang direkomendasikan:

1. Jalankan export read-only dari `/admin/audit/export?...` bila data perlu diarsipkan.
2. Verifikasi cutoff retention lewat `bun run audit:prune:dry-run`.
3. Eksekusi `bun run audit:prune` pada scheduler.

Contoh Linux cron harian jam 02:30:

```cron
30 2 * * * cd /path/to/my-portfolio && /usr/local/bin/bun run audit:prune >> /var/log/my-portfolio-audit-prune.log 2>&1
```

Contoh systemd service:

```ini
[Unit]
Description=My Portfolio audit prune

[Service]
Type=oneshot
WorkingDirectory=/path/to/my-portfolio
ExecStart=/usr/local/bin/bun run audit:prune
```

Contoh systemd timer:

```ini
[Unit]
Description=Run My Portfolio audit prune daily

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true

[Install]
WantedBy=timers.target
```

Contoh Windows Task Scheduler:

1. Buat task baru dengan trigger harian.
2. Set `Program/script` ke path `bun.exe`.
3. Set `Add arguments` ke `run audit:prune`.
4. Set `Start in` ke folder project ini.
5. Jalankan sekali manual untuk memastikan env dan akses database tersedia.

Catatan:

- Scheduler harus berjalan pada environment yang memiliki `DATABASE_URL`, `AUTH_SECRET`, dan kredensial Upstash yang sama dengan runtime aplikasi.
- Jalankan di host internal/worker tepercaya, bukan dari browser admin.
- Jika ingin arsip rutin, lakukan export terlebih dahulu lalu prune, jangan prune buta.

## Architecture Summary

Sistem dibagi menjadi empat lapisan utama:

- Public App Router:
  landing page, projects, blog, metadata SEO, sitemap, robots, dan ISR 5 menit.
- Admin App Router:
  dashboard protected untuk login, CRUD project/blog, inbox contact, audit viewer, dan export audit read-only.
- Route Handlers:
  `/api/auth/*`, `/api/projects*`, `/api/blog*`, `/api/contact` untuk auth, mutation, validasi, upload, revalidate, dan audit logging.
- Data and security services:
  Prisma + MySQL untuk persistence, Upstash Redis untuk distributed rate limiting, local upload service untuk thumbnail/cover image, serta helper CSRF, origin validation, JWT session, dan audit lifecycle.

Komponen operasional penting:

- `proxy.ts` menangani redirect optimistik admin dan distribusi CSRF token request-side.
- JWT admin disimpan pada cookie `HttpOnly` dan diverifikasi server-side di halaman protected serta API mutatif.
- Upload image diproses ulang ke WebP, dibatasi MIME/signature/ukuran, dan disimpan di `public/uploads/...`.
- Audit log mencatat login, logout, create, update, delete, publish state, failed login, dan alert threshold dengan payload yang sudah diminimalkan.
- Public cache memakai ISR + `revalidatePath()` setelah mutation agar slug lama dan baru sama-sama ter-refresh.

## Production Readiness Checklist

Checklist ini merefleksikan implementasi dan verifikasi saat ini:

- `App Router`, TypeScript, server-first rendering, dan route handlers aktif.
- Public landing page dapat diakses tanpa login.
- Login admin, logout, CRUD project/blog, upload image, audit viewer, audit export, inbox contact, dan delete flow telah diuji manual.
- Slug update diverifikasi: slug lama `404`, slug baru `200`, lalu delete mengembalikan detail menjadi `404`.
- Rate limit contact dan login diverifikasi dengan respons `429` dan `Retry-After`.
- Failed-login telemetry tampil masked di audit viewer.
- Header keamanan aktif: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, `CORP`.
- Sitemap, robots, metadata SEO, Open Graph, Twitter card, dan structured data aktif.
- Audit prune script tersedia dan siap dijalankan via scheduler eksternal.
- `bun run test`, `bun run lint`, dan `bun run build` harus hijau sebelum deploy.

Hal yang tetap perlu dipastikan di environment produksi:

- Deploy lewat HTTPS agar cookie `Secure` berjalan sesuai posture keamanan produksi.
- Isi `NEXT_PUBLIC_SITE_URL` dengan origin final produksi.
- Pastikan worker/scheduler memiliki akses network ke MySQL dan Upstash Redis.
- Pantau kapasitas tabel `ContactMessage` terpisah karena retention saat ini difokuskan ke audit log, bukan inbox kontak.
- Jika memakai beberapa instance, samakan env dan secret pada seluruh node.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
