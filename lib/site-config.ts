import { appEnv } from "@/lib/env";

export const siteConfig = {
  name: "Mugi Nurul Ihksani",
  shortName: "Mugiew",
  brandWordmark: "mugiew",
  role: "Backend-Focused Fullstack Developer",
  title: "Mugiew | Fullstack Developer",
  description:
    "Portfolio Mugiew, backend-focused fullstack developer yang membangun aplikasi web modern, dashboard operasional, dan dokumentasi teknis yang rapi.",
  siteUrl: appEnv.siteUrl,
  email: appEnv.contactEmail,
  githubUrl: appEnv.githubUrl,
  linkedinUrl: appEnv.linkedinUrl,
} as const;

export const publicNavigation = [
  { label: "Tentang", href: "/#about" },
  { label: "Skill", href: "/#skills" },
  { label: "Tech Stack", href: "/#stack" },
  { label: "Project", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Beri Dukungan", href: "/beri-dukungan" },
  { label: "Kontak", href: "/#contact" },
] as const;
