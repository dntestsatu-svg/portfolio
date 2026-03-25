Portfolio fullstack modern berbasis Next.js App Router, Bun, Prisma, MySQL, dan fokus pada delivery production-minded untuk website publik, blog teknis, case study, admin workspace, audit log, serta flow dukungan via QRIS.

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

## Route Overview

Public routes utama:

- `/`
- `/blog`
- `/blog/[slug]`
- `/blog/category/[slug]`
- `/blog/tag/[slug]`
- `/blog/search?q=`
- `/projects`
- `/projects/[slug]`
- `/projects/category/[slug]`
- `/projects/search?q=`
- `/beri-dukungan`
- `/dukungan/ranking`

Admin dan internal routes:

- `/admin/login`
- `/admin`
- `/admin/projects`
- `/admin/blog`
- `/admin/messages`
- `/admin/audit`
- `/admin/audit/export`
- `/api/auth/*`
- `/api/projects*`
- `/api/blog*`
- `/api/contact`
- `/api/support/generate`
- `/api/support/[customRef]`
- `/api/webhook/goqr`

## Environment Variables Penting

Minimal untuk runtime production yang sehat:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Opsional tetapi penting bila flow dukungan QRIS dipakai:

- `API_GOQR_ENDPOINT`
- `API_GOQR_TOKONAME`
- `API_GOQR_TOKEN`
- `API_GOQR_WEBHOOK_SECRET`

Catatan operasional:

- `AUTH_SECRET` placeholder dianggap tidak valid.
- `NEXT_PUBLIC_SITE_URL` harus berupa origin final production, bukan `localhost` atau `example.com`.
- Pada production, endpoint yang dilindungi rate limit akan menolak request bila Upstash tidak dikonfigurasi.

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

## Security Notes

- Semua mutation admin membutuhkan session JWT + origin validation + CSRF token.
- Failed login dicatat dalam audit log dengan identifier yang sudah dimasking dan di-hash.
- Upload image divalidasi lewat MIME, magic bytes, ukuran file, dan dibatasi input pixel.
- Webhook GOQR mendukung shared secret tambahan via `API_GOQR_WEBHOOK_SECRET`.
- Support leaderboard hanya menghitung transaksi `success` yang memang diizinkan tampil publik.
- Snapshot transaksi dukungan yang dikirim ke client sudah diminimalkan dan tidak membawa field internal sensitif seperti `merchant_id`.

## Residual Tradeoffs

- Search blog/project masih memakai strategi scoring sederhana in-memory; cukup untuk skala konten kecil-menengah, tetapi bukan full-text engine.
- Fallback seed content tetap tersedia ketika database publik kosong; ini membantu local/dev, tetapi production idealnya selalu mengandalkan data nyata di database.
- Retention terjadwal saat ini difokuskan ke audit log; inbox contact belum memiliki lifecycle prune terpisah.
- Flow QRIS tetap bergantung pada API eksternal. Timeout, validasi webhook, dan update idempotent sudah ada, tetapi availability akhir tetap mengikuti gateway.
