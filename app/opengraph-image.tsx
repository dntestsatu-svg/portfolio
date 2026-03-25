import { ImageResponse } from "next/og";

export const alt = "Portfolio Mugiew";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top right, rgba(201,165,106,0.35), transparent 28%), radial-gradient(circle at left top, rgba(107,198,189,0.25), transparent 24%), linear-gradient(160deg, #07090d 0%, #111827 100%)",
          color: "white",
          padding: "72px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 40,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />

        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#c9a56a",
              fontSize: 26,
              letterSpacing: 6,
            }}
          >
            MN
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 24,
                letterSpacing: 8,
                textTransform: "uppercase",
                color: "#c9a56a",
              }}
            >
              Mugiew
            </div>
            <div style={{ fontSize: 24, color: "#cbd5e1" }}>
              Backend-Focused Fullstack Developer
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.04 }}>
            Membangun aplikasi web modern yang rapi, cepat, dan kredibel.
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.4, color: "#cbd5e1" }}>
            Next.js, PHP, TypeScript, Go, dashboard operasional, dan dokumentasi teknis
            dengan pendekatan yang production-minded.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
