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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
