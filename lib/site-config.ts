export const siteConfig = {
  name: "Rodex Castello",
  shortName: "Rodex",
  role: "Backend-Focused Fullstack Developer",
  title: "Rodex Castello | Fullstack Developer",
  description:
    "Portfolio Rodex Castello, backend-focused fullstack developer yang membangun aplikasi web modern, dashboard operasional, dan dokumentasi teknis yang rapi.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL,
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL,
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
