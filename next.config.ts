import crypto from "node:crypto";
import type { NextConfig } from "next";
import { getHomeStructuredDataJson } from "./lib/structured-data";

const isDevelopment = process.env.NODE_ENV !== "production";
const homeStructuredDataHash = crypto
  .createHash("sha256")
  .update(getHomeStructuredDataJson())
  .digest("base64");
const scriptSrc = isDevelopment
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : `script-src 'self' 'sha256-${homeStructuredDataHash}'`;
const styleSrc = isDevelopment ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "script-src-attr 'none'",
  styleSrc,
  "style-src-attr 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
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
