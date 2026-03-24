import type { Metadata } from "next";
import { SupportLeaderboardPreview } from "@/components/support/support-leaderboard-preview";
import { SupportFlow } from "@/components/support/support-flow";
import { getSupportLeaderboardPreview } from "@/lib/services/support";
import { getWebPageStructuredData, toStructuredDataJson } from "@/lib/structured-data";

const pageTitle = "Beri Dukungan";
const pageDescription =
  "Halaman dukungan via QRIS untuk pembaca yang ingin memberi apresiasi secara sukarela dengan proses yang jelas, aman, terverifikasi, dan bisa tampil elegan di leaderboard publik jika diizinkan.";
const structuredDataJson = toStructuredDataJson(
  getWebPageStructuredData({
    path: "/beri-dukungan",
    title: `${pageTitle} | Rodex Castello`,
    description: pageDescription,
  }),
);

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/beri-dukungan",
  },
  openGraph: {
    type: "website",
    url: "/beri-dukungan",
    title: `${pageTitle} | Rodex Castello`,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pageTitle} | Rodex Castello`,
    description: pageDescription,
    images: ["/opengraph-image"],
  },
};

export default async function SupportPage() {
  const leaderboard = await getSupportLeaderboardPreview();

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredDataJson,
        }}
      />
      <SupportFlow />
      <SupportLeaderboardPreview leaderboard={leaderboard} />
    </main>
  );
}
