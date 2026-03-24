import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin;
const formActionOrigins = new Set(["'self'", siteOrigin]);
const cloudflareAnalyticsScriptOrigin = "https://static.cloudflareinsights.com";
const cloudflareAnalyticsConnectOrigin = "https://cloudflareinsights.com";

if (siteOrigin === "http://localhost:3000" || siteOrigin === "http://127.0.0.1:3000") {
  formActionOrigins.add("http://localhost:3000");
  formActionOrigins.add("http://127.0.0.1:3000");
}

const scriptSrcOrigins = ["'self'", "'unsafe-inline'", cloudflareAnalyticsScriptOrigin];
if (isDevelopment) {
  scriptSrcOrigins.push("'unsafe-eval'");
}

const scriptSrc = `script-src ${scriptSrcOrigins.join(" ")}`;
const scriptSrcElem = `script-src-elem ${scriptSrcOrigins.join(" ")}`;
const styleSrc = "style-src 'self' 'unsafe-inline'";
const connectSrc = `connect-src 'self' ${cloudflareAnalyticsConnectOrigin}`;

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  scriptSrcElem,
  "script-src-attr 'none'",
  styleSrc,
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  connectSrc,
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  `form-action ${Array.from(formActionOrigins).join(" ")}`,
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    sri: {
      algorithm: "sha256",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
