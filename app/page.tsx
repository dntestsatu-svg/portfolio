import Link from "next/link";
import { Suspense } from "react";
import { ArticleCard } from "@/components/marketing/article-card";
import { ContactStatus } from "@/components/marketing/contact-status";
import { ProjectCard } from "@/components/marketing/project-card";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SkillMeter } from "@/components/marketing/skill-meter";
import {
  educationNarrative,
  educationTimeline,
  heroHighlights,
  heroStats,
  profileParagraphs,
  reasonsToWorkWithMe,
  seedContentNote,
  skillGroups,
  skillMetrics,
  stackGroups,
  workflowSteps,
} from "@/lib/portfolio-data";
import { getPublicArticles, getPublicProjects } from "@/lib/services/content";
import { siteConfig } from "@/lib/site-config";
import { getHomeStructuredDataJson } from "@/lib/structured-data";

const structuredDataJson = getHomeStructuredDataJson();

const contactLinks = [
  siteConfig.email
    ? { label: "Email", href: `mailto:${siteConfig.email}` }
    : null,
  siteConfig.githubUrl ? { label: "GitHub", href: siteConfig.githubUrl } : null,
  siteConfig.linkedinUrl
    ? { label: "LinkedIn", href: siteConfig.linkedinUrl }
    : null,
].filter((link): link is { label: string; href: string } => Boolean(link));

export const revalidate = 300;
export default async function Home() {
  const [projects, articles] = await Promise.all([getPublicProjects(), getPublicArticles()]);
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredDataJson,
        }}
      />

      <section className="section-space pt-16 md:pt-24">
        <div className="site-shell grid items-start gap-8 lg:grid-cols-[minmax(0,1.18fr)_400px] lg:gap-10">
          <div className="hero-reveal space-y-7">
            <span className="eyebrow">Portfolio developer · production-minded</span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">
                Rodex Castello
              </h1>
              <p className="max-w-3xl text-xl leading-9 text-slate-200 md:text-2xl">
                Backend-focused fullstack developer yang membangun aplikasi web
                cepat, terstruktur, dan relevan untuk kebutuhan bisnis nyata.
              </p>
              <p className="copy-muted max-w-3xl text-base md:text-lg">
                Saya fokus pada backend engineering, arsitektur aplikasi,
                struktur data, integrasi API, dan praktik implementasi yang
                menjaga kualitas produk tetap stabil. Frontend saya gunakan
                sebagai pelengkap agar delivery tetap utuh dari ujung ke ujung.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/projects" className="button-primary">
                Lihat Project
              </Link>
              <Link href="/#contact" className="button-secondary">
                Hubungi Saya
              </Link>
              <Link href="/blog" className="button-secondary">
                Baca Blog
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroHighlights.map((item) => (
                <span key={item} className="tag-chip-subtle">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="surface-panel hero-reveal rounded-[2rem] p-6" data-delay="2">
            <div className="space-y-3">
              <p className="text-sm font-semibold tracking-[0.24em] text-[var(--color-accent)] uppercase">
                Ringkasan profesional
              </p>
              <p className="copy-muted text-sm">
                Positioning saya jelas: backend engineering sebagai kekuatan
                utama, dengan kemampuan frontend yang cukup matang untuk
                membangun produk fullstack end-to-end.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {heroStats.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  <p className="copy-muted mt-2 text-sm">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[rgba(201,165,106,0.24)] bg-[rgba(201,165,106,0.08)] p-4">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Core metrics
              </p>
              <div className="mt-4 grid gap-3">
                {skillMetrics.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-200">{skill.name}</span>
                    <span className="font-mono text-[var(--color-accent)]">{skill.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="about" className="section-space">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="About me"
              title="Latar belakang yang dibentuk oleh disiplin belajar dan praktik nyata"
              description="Saya tidak membangun profil profesional dari klaim besar, tetapi dari kebiasaan kerja yang konsisten, eksplorasi teknologi yang serius, dan project yang dikerjakan dengan standar yang jelas."
            />

            <div className="grid gap-5">
              {profileParagraphs.map((paragraph) => (
                <p key={paragraph} className="copy-muted text-base md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="surface-panel rounded-[2rem] p-6">
              <h3 className="text-xl font-semibold text-white">Perjalanan belajar</h3>
              <p className="copy-muted mt-4 text-sm md:text-base">
                {educationNarrative}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-panel rounded-[2rem] p-6">
              <h3 className="text-xl font-semibold text-white">Riwayat pendidikan</h3>
              <div className="mt-6 grid gap-4">
                {educationTimeline.map((item) => (
                  <article
                    key={item.school}
                    className="rounded-2xl border border-white/8 bg-white/4 p-5"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      {item.level}
                    </p>
                    <h4 className="mt-3 text-lg font-semibold text-white">{item.school}</h4>
                    <p className="copy-muted mt-2 text-sm">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-[2rem] p-6">
              <h3 className="text-xl font-semibold text-white">Fokus saat ini</h3>
              <p className="copy-muted mt-4 text-sm">
                Saya menempatkan backend sebagai fondasi utama, lalu melengkapi
                delivery dengan frontend yang bersih, semantic HTML yang benar,
                SEO yang rapi, dan dokumentasi yang mudah dipahami pengguna.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="section-space">
        <div className="site-shell space-y-10">
          <SectionHeading
            eyebrow="Skills"
            title="Kompetensi inti yang saya gunakan untuk menyelesaikan pekerjaan nyata"
            description="Saya bekerja dengan kombinasi bahasa, framework, database, dan fundamental web yang saling menguatkan. Hasilnya adalah delivery yang tidak hanya selesai, tetapi juga rapi dan masuk akal untuk dipelihara."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {skillMetrics.map((skill) => (
              <SkillMeter key={skill.name} skill={skill} />
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {skillGroups.map((group) => (
              <article key={group.title} className="surface-panel rounded-[2rem] p-5">
                <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                <p className="copy-muted mt-3 text-sm">{group.description}</p>
                <ul className="mt-5 grid gap-2 text-sm text-slate-200">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="section-space">
        <div className="site-shell space-y-10">
          <SectionHeading
            eyebrow="Tech stack"
            title="Terbiasa membangun solusi end-to-end dengan ekosistem modern"
            description="Saya nyaman bekerja dari sisi API dan data layer sampai antarmuka publik, selama pilihan teknologinya tetap relevan dengan kebutuhan, performa, dan skala pengembangan."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {stackGroups.map((group) => (
              <article key={group.title} className="surface-panel rounded-[2rem] p-6">
                <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                <p className="copy-muted mt-3 text-sm">{group.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="tag-chip-subtle">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-shell space-y-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Featured projects"
              title="Highlight project yang paling tepat untuk mewakili cara saya bekerja"
              description="Saya sengaja menyiapkan struktur studi kasus yang mudah dipindai recruiter, client, dan pengunjung umum. Setiap kartu dirancang untuk menampilkan konteks, stack, dan fokus implementasi secara singkat."
            />
            <Link href="/projects" className="button-secondary">
              Lihat semua project
            </Link>
          </div>

          <p className="copy-muted max-w-4xl text-sm">{seedContentNote}</p>

          <div className="grid gap-5 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section-space">
        <div className="site-shell space-y-10">
          <SectionHeading
            eyebrow="All projects"
            title="Format daftar project yang siap tumbuh bersama dashboard admin"
            description="Landing page ini sudah mempersiapkan pola presentasi project: thumbnail, ringkasan, stack, fitur utama, dan ruang untuk link demo, repository, maupun tutorial."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-shell space-y-10">
          <SectionHeading
            eyebrow="Workflow"
            title="Cara saya bekerja dari fase perencanaan sampai delivery"
            description="Saya lebih nyaman bekerja dengan proses yang rapi, bertahap, dan bisa dipertanggungjawabkan. Pola ini membantu project tetap jelas secara teknis maupun bisnis."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {workflowSteps.map((step) => (
              <article key={step.title} className="surface-panel rounded-[2rem] p-5">
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="copy-muted mt-3 text-sm">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-shell space-y-10">
          <SectionHeading
            eyebrow="Why work with me"
            title="Pendekatan kerja yang fokus pada hasil, bukan sekadar output cepat"
            description="Saya mengutamakan struktur yang sehat sejak awal supaya project tetap enak dikembangkan, aman digunakan, dan tidak menjadi beban teknis di tahap berikutnya."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reasonsToWorkWithMe.map((reason) => (
              <article key={reason.title} className="surface-panel rounded-[2rem] p-5">
                <h3 className="text-lg font-semibold text-white">{reason.title}</h3>
                <p className="copy-muted mt-3 text-sm">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="section-space">
        <div className="site-shell space-y-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Blog / article"
              title="Ruang untuk tutorial, penjelasan fitur, dan catatan implementasi"
              description="Saya ingin portfolio ini tidak hanya menunjukkan hasil akhir, tetapi juga menjelaskan cara berpikir, keputusan teknis, dan penggunaan project secara lebih terbuka."
            />
            <Link href="/blog" className="button-secondary">
              Buka halaman blog
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-space">
        <div className="site-shell grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Contact"
              title="Terbuka untuk diskusi project, kolaborasi, dan kebutuhan pengembangan"
              description="Jika Anda membutuhkan developer yang kuat di backend, paham alur fullstack, dan terbiasa memikirkan kualitas implementasi sejak awal, saya siap berdiskusi lebih lanjut."
            />

            <div className="surface-panel rounded-[2rem] p-6">
              <h3 className="text-xl font-semibold text-white">Titik kontak cepat</h3>
              {contactLinks.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {contactLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="button-secondary"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="copy-muted mt-4 text-sm">
                  Tambahkan email, GitHub, atau LinkedIn melalui environment
                  variable agar tombol kontak publik aktif secara penuh.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/projects" className="button-secondary">
                  Jelajahi project
                </Link>
                <Link href="/blog" className="button-secondary">
                  Baca artikel
                </Link>
              </div>

              <Suspense fallback={null}>
                <ContactStatus />
              </Suspense>
            </div>
          </div>

          <form
            className="surface-panel rounded-[2rem] p-6"
            action="/api/contact"
            method="post"
            aria-describedby="contact-note"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-200">
                  Nama
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="field-input"
                  placeholder="Nama Anda"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field-input"
                  placeholder="email@domain.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <label htmlFor="subject" className="text-sm font-medium text-slate-200">
                Topik
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="field-input"
                placeholder="Kebutuhan project atau kolaborasi"
                required
              />
            </div>

            <div className="mt-5 grid gap-2">
              <div className="honeypot-field" aria-hidden="true">
                <label htmlFor="company" className="text-sm font-medium text-slate-200">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="field-input"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <label htmlFor="message" className="text-sm font-medium text-slate-200">
                Pesan
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="field-input resize-none"
                placeholder="Jelaskan kebutuhan Anda secara singkat"
                required
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" className="button-primary">
                Kirim pesan
              </button>
              <p id="contact-note" className="copy-muted text-sm">
                Form ini terhubung ke `/api/contact` dan dapat dipantau dari dashboard admin.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
