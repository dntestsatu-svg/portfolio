import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/marketing/project-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { seedContentNote } from "@/lib/portfolio-data";
import { getPublicProjects } from "@/lib/services/content";

export const metadata: Metadata = {
  title: "Project",
  description: "Daftar studi kasus dan format project portfolio Rodex Castello.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    url: "/projects",
    title: "Project | Rodex Castello",
    description: "Daftar studi kasus dan format project portfolio Rodex Castello.",
  },
  twitter: {
    title: "Project | Rodex Castello",
    description: "Daftar studi kasus dan format project portfolio Rodex Castello.",
  },
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <main id="main-content" className="section-space">
      <div className="site-shell space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Projects archive"
            title="Daftar project yang siap dipresentasikan secara profesional"
            description="Halaman ini disiapkan untuk menampilkan studi kasus secara lebih fokus, lengkap dengan thumbnail, stack, fitur utama, dan ruang untuk demo, repo, serta tutorial."
          />
          <Link href="/" className="button-secondary">
            Kembali ke beranda
          </Link>
        </div>

        <p className="copy-muted max-w-4xl text-sm">{seedContentNote}</p>

        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
