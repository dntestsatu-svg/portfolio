export type SkillMetric = {
  name: string;
  level: number;
  description: string;
};

export type SkillGroup = {
  title: string;
  description: string;
  items: string[];
};

export type WorkflowStep = {
  title: string;
  description: string;
};

export type ValuePoint = {
  title: string;
  description: string;
};

export type ProjectItem = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  problemContext?: string;
  solutionBuilt?: string;
  roleLabel?: string;
  roleSummary?: string;
  focusAreas?: string[];
  architectureHighlights?: string[];
  decisionNotes?: string[];
  lessonsLearned?: string;
  body?: string;
  tutorial?: string;
  thumbnail: string;
  thumbnailAlt: string;
  techStack: string[];
  features: string[];
  featured: boolean;
  published?: boolean;
  publishedAt?: string;
  publishedAtLabel?: string;
  updatedAt?: string;
  updatedAtLabel?: string;
  demoUrl?: string;
  repoUrl?: string;
  tutorialUrl?: string;
};

export type ArticleItem = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  publishedAtISO?: string;
  updatedAtISO?: string;
  updatedAtLabel?: string;
  content?: string;
  tags?: string[];
  coverImage?: string | null;
  published?: boolean;
  href?: string;
};

export const heroHighlights = [
  "Fokus utama pada backend engineering",
  "Nyaman membangun aplikasi fullstack end-to-end",
  "Terbiasa bekerja dengan struktur data, API, dan integritas sistem",
  "Berorientasi pada performa, keamanan, dan maintainability",
];

export const heroStats = [
  {
    title: "Fokus kerja",
    value: "Backend engineering",
    description: "Arsitektur aplikasi, API, data, dan integritas sistem.",
  },
  {
    title: "Cakupan delivery",
    value: "End-to-end fullstack",
    description: "Frontend, backend, database, hingga dokumentasi produk.",
  },
  {
    title: "Pendekatan",
    value: "Quality-oriented",
    description: "Security-aware, clean code, dan struktur yang scalable.",
  },
] as const;

export const profileParagraphs = [
  "Saya Rodex Castello, 27 tahun, seorang backend-focused fullstack developer yang terbiasa menerjemahkan kebutuhan operasional menjadi aplikasi web yang rapi, efisien, dan siap dikembangkan.",
  "Fokus utama saya berada pada backend engineering: merancang alur aplikasi, struktur database, integrasi API, keamanan dasar aplikasi, serta kualitas implementasi yang stabil di lingkungan nyata.",
  "Di sisi lain, saya tetap nyaman menangani frontend sebagai pelengkap agar produk yang dibangun terasa utuh, responsif, mudah dipahami, dan tetap konsisten dari sisi pengalaman pengguna.",
];

export const educationTimeline = [
  {
    level: "Pondasi awal",
    school: "TK NURUL BAHRI MUARA ANGKE",
    description:
      "Fase awal pembentukan disiplin belajar, rasa ingin tahu, dan kebiasaan memahami proses secara bertahap.",
  },
  {
    level: "Penguatan dasar",
    school: "SDN PLUIT 05 PAGI MUARA ANGKE",
    description:
      "Tahap penguatan dasar berpikir terstruktur yang kemudian banyak membantu dalam memecah masalah teknis ke langkah yang lebih jelas.",
  },
  {
    level: "Fase formal terakhir",
    school: "SMP Yayasan Cinta Kasih Tzu Chi Cengkareng",
    description:
      "Setelah fase ini, jalur pengembangan profesional saya tumbuh melalui praktik intensif, eksplorasi teknologi, dokumentasi resmi, dan pembangunan project nyata secara mandiri.",
  },
] as const;

export const educationNarrative =
  "Latar pendidikan formal saya berhenti di tingkat SMP. Namun, perkembangan teknis saya dibangun lewat kebiasaan belajar mandiri yang disiplin, eksplorasi teknologi yang konsisten, dan eksekusi project nyata. Pendekatan ini membentuk cara kerja yang praktis, adaptif, dan dekat dengan kebutuhan implementasi di lapangan.";

export const skillMetrics: SkillMetric[] = [
  {
    name: "Spreadsheet / Excel",
    level: 95,
    description:
      "Kuat untuk pengolahan data, formula, laporan operasional, dan otomasi kerja berbasis spreadsheet.",
  },
  {
    name: "PHP",
    level: 96,
    description:
      "Dipakai untuk membangun backend yang stabil, modular, dan dekat dengan kebutuhan bisnis nyata.",
  },
  {
    name: "JavaScript",
    level: 92,
    description:
      "Digunakan untuk interaktivitas antarmuka, integrasi client-side, dan alur web modern.",
  },
  {
    name: "TypeScript",
    level: 90,
    description:
      "Membantu menjaga struktur kode tetap tegas, aman, dan mudah dipelihara pada project skala menengah hingga besar.",
  },
  {
    name: "Go",
    level: 87,
    description:
      "Digunakan untuk service yang efisien, clean, dan siap menangani kebutuhan concurrency.",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Programming Language",
    description:
      "Bahasa inti untuk backend, scripting, dan antarmuka aplikasi modern.",
    items: ["PHP", "JavaScript", "TypeScript", "Go"],
  },
  {
    title: "Framework",
    description:
      "Ekosistem yang saya gunakan untuk mempercepat delivery tanpa mengorbankan kualitas struktur.",
    items: ["Laravel", "CodeIgniter", "Vue", "Next.js", "Gin", "GORM"],
  },
  {
    title: "Database",
    description:
      "Terbiasa merancang struktur data, menjaga integritas, dan memikirkan performa query sejak awal.",
    items: ["MySQL", "PostgreSQL", "Schema design", "Query optimization"],
  },
  {
    title: "Tools",
    description:
      "Alat kerja yang membantu implementasi lebih efisien dan maintainable.",
    items: ["Git", "REST API", "JSON", "Linux workflow", "Redis", "Postman"],
  },
  {
    title: "Web Fundamentals",
    description:
      "Pemahaman dasar web tetap saya jaga kuat agar solusi teknis tidak rapuh di lapisan paling bawah.",
    items: ["HTTP / HTTPS", "Semantic HTML", "Responsive CSS", "Backend integration"],
  },
];

export const stackGroups: SkillGroup[] = [
  {
    title: "Backend Delivery",
    description:
      "Membangun API, merancang struktur aplikasi, validasi, dan alur autentikasi yang aman.",
    items: ["PHP", "Laravel", "CodeIgniter", "Go", "Gin", "RESTful API"],
  },
  {
    title: "Frontend Companion",
    description:
      "Menghadirkan antarmuka yang rapi, responsif, dan tetap fokus pada kredibilitas produk.",
    items: ["Next.js", "Vue", "TypeScript", "Responsive UI", "Semantic HTML"],
  },
  {
    title: "Data Layer",
    description:
      "Menjaga kualitas fondasi data dengan struktur yang jelas, query yang sehat, dan ORM yang tepat.",
    items: ["MySQL", "PostgreSQL", "GORM", "Redis", "Data integrity"],
  },
  {
    title: "Engineering Practice",
    description:
      "Pendekatan kerja saya menekankan keamanan dasar, maintainability, dan kesiapan scale-up.",
    items: [
      "XSS prevention",
      "SQL injection mitigation",
      "CSRF protection",
      "Input validation",
      "Concurrency",
    ],
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: "Planning",
    description:
      "Memahami konteks masalah, memetakan kebutuhan, dan menentukan prioritas implementasi yang realistis.",
  },
  {
    title: "Architecture",
    description:
      "Menyusun struktur data, alur aplikasi, modul, dan batas tanggung jawab komponen secara jelas.",
  },
  {
    title: "Development",
    description:
      "Mengerjakan implementasi bertahap dengan fokus pada stabilitas, keterbacaan, dan konsistensi kode.",
  },
  {
    title: "Testing",
    description:
      "Melakukan pengecekan manual, validasi alur, dan review kualitas agar regresi bisa ditekan sejak awal.",
  },
  {
    title: "Deployment",
    description:
      "Menyiapkan hasil akhir yang siap dipublikasikan, terdokumentasi, dan nyaman untuk pengembangan berikutnya.",
  },
];

export const reasonsToWorkWithMe: ValuePoint[] = [
  {
    title: "Performa sebagai prioritas",
    description:
      "Saya mengutamakan struktur yang ringan, rendering yang efisien, dan query yang sehat sejak tahap implementasi awal.",
  },
  {
    title: "Security-aware engineering",
    description:
      "XSS, SQL Injection, CSRF, validasi input, dan alur autentikasi yang aman selalu menjadi bagian dari pertimbangan teknis.",
  },
  {
    title: "Clean code yang bertahan lama",
    description:
      "Saya lebih memilih solusi yang rapi, mudah dibaca, dan mudah diteruskan daripada kode yang terlihat cepat namun sulit dirawat.",
  },
  {
    title: "Scalable system thinking",
    description:
      "Saya terbiasa memikirkan modularitas, reusable pattern, dan kesiapan perubahan kebutuhan sejak fondasi awal dibuat.",
  },
];

export const projects: ProjectItem[] = [
  {
    slug: "portfolio-content-platform",
    name: "Portfolio Content Platform",
    category: "Content Platform",
    summary:
      "Platform portfolio dan content system yang menggabungkan landing page profesional, blog teknis, case study projects, admin CMS, discovery layer, dan SEO production dalam satu codebase Next.js.",
    description:
      "Project ini adalah aplikasi yang sedang Anda lihat sekarang: portfolio publik yang saya kembangkan menjadi sistem konten dengan blog, project archive, admin workspace, audit log, dan jalur discovery yang nyata.",
    problemContext:
      "Banyak portfolio developer berhenti sebagai landing page statis: pengunjung datang, melihat beberapa section, lalu mentok. Di sisi lain, CMS kecil sering terasa berat, tidak SEO-aware, atau tidak nyaman dipakai untuk menulis dan mengelola konten. Project ini dibuat untuk menjembatani keduanya dalam satu platform yang tetap cepat, jelas, dan production-minded.",
    solutionBuilt:
      "Saya membangun satu platform yang menyatukan halaman publik, blog teknis, project archive, case study detail, admin workspace, auth yang diperketat, audit log, taxonomy, search, related content, dan metadata SEO tanpa memecah semuanya ke banyak aplikasi terpisah.",
    roleLabel: "Product design · fullstack engineering",
    roleSummary:
      "Saya menangani product thinking, information architecture, implementasi Next.js App Router, data model Prisma, auth admin, hardening security, rendering markdown, discovery service, serta polish UX publik dan admin.",
    focusAreas: [
      "Public content discovery untuk blog dan projects",
      "Admin workspace yang efisien untuk authoring dan audit",
      "SEO, security, dan operasional production dalam satu codebase",
    ],
    architectureHighlights: [
      "Public site dan admin dipisah dengan shell yang berbeda, tetapi berbagi service layer untuk content, rendering, SEO, dan cache invalidation.",
      "Blog dan project discovery dibangun dengan service modular untuk archive, taxonomy, search, related content, dan pagination agar query tetap rapi dan siap ditingkatkan.",
      "Auth admin memakai JWT HttpOnly cookie, CSRF protection, rate limiting terdistribusi, audit log, dan ISR revalidation setelah setiap mutasi konten.",
    ],
    decisionNotes: [
      "Markdown dipilih sebagai format authoring utama karena stabil untuk versioning, mudah dipreview, dan konsisten dirender di admin maupun publik.",
      "Halaman search dibuat noindex, sedangkan detail content dan category page tetap indexable agar SEO tidak dipenuhi halaman tipis.",
      "Admin workspace diprioritaskan untuk kepadatan informasi dan kecepatan kerja, bukan mengikuti gaya landing page publik.",
    ],
    lessonsLearned:
      "Portfolio yang benar-benar meyakinkan bukan hanya soal tampilan, tetapi soal bagaimana pengunjung menemukan konten yang relevan, memahami kedalaman implementasi, dan melihat bahwa sistemnya memang dibangun dengan disiplin engineering.",
    body:
      "## Tujuan produk\n\nProject ini berangkat dari kebutuhan untuk membuat portfolio yang tidak berhenti sebagai halaman profil. Saya ingin situs ini berfungsi sebagai sistem konten yang benar-benar hidup: pengunjung bisa masuk dari landing page, archive blog, detail article, taxonomy, search, atau project case study, lalu tetap punya jalur eksplorasi yang jelas.\n\n## Fondasi teknis\n\nAplikasi dibangun dengan Next.js App Router dan TypeScript, memakai server components sebagai default, Prisma untuk data layer, MySQL untuk persistence, dan pendekatan ISR untuk menjaga keseimbangan antara performa, freshness konten, dan SEO. Rendering markdown, admin preview, dan public detail page juga dibuat konsisten agar authoring tidak menghasilkan kejutan saat publish.\n\n## Discovery dan SEO\n\nNilai utama project ini ada pada discovery. Blog dan projects tidak diperlakukan sebagai daftar card statis, melainkan sistem yang punya archive, taxonomy, search, related content, prev or next navigation, metadata dinamis, JSON-LD, sitemap, dan robots policy yang sengaja dirancang. Dengan begitu, pengunjung tidak mentok di satu halaman, dan crawler juga mendapat struktur yang lebih sehat.\n\n## Operasional dan hardening\n\nDi sisi admin, sistem ini memakai auth berbasis JWT HttpOnly cookie, CSRF protection, rate limiting, audit log, dan retention policy untuk menjaga operasional tetap rapi. Tujuannya bukan hanya membuat halaman admin bisa dipakai, tetapi membuatnya cukup aman dan cukup terukur untuk workflow yang benar-benar dipakai mengelola konten.",
    tutorial:
      "Jika Anda ingin mengembangkan portfolio menjadi content system, mulai dari tiga fondasi ini: struktur content model yang jelas, discovery flow publik yang hidup, dan admin workspace yang benar-benar nyaman dipakai menulis. Visual bisa dipoles belakangan, tetapi arsitektur informasi harus benar sejak awal.",
    thumbnail: "/projects/knowledge-base-portal.svg",
    thumbnailAlt: "Ilustrasi platform portfolio dan content system dengan layout editorial modern",
    techStack: ["Next.js", "TypeScript", "Prisma", "MySQL", "Upstash Redis"],
    features: [
      "Admin CMS untuk blog dan projects",
      "Search, taxonomy, dan related content",
      "Audit log, CSRF, dan rate limiting",
      "Metadata SEO, sitemap, dan robots policy",
    ],
    featured: true,
    published: true,
    updatedAt: "2026-03-24T00:00:00.000Z",
    demoUrl: "/",
    tutorialUrl: "/blog/membangun-portfolio-content-system-dengan-nextjs-app-router",
  },
  {
    slug: "operational-dashboard",
    name: "Operational Dashboard",
    category: "Internal Operations",
    summary:
      "Dashboard operasional untuk memusatkan KPI harian, exception queue, approval lintas role, dan laporan yang harus dibaca tim setiap pagi.",
    description:
      "Project ini merangkum kebutuhan tim operasional yang sebelumnya mengandalkan spreadsheet terpisah, rekap manual, dan follow-up chat untuk memantau exception harian.",
    problemContext:
      "Masalah utamanya bukan sekadar tidak adanya dashboard, tetapi tidak adanya satu jalur kerja yang menyatukan snapshot KPI, antrean masalah yang perlu ditindak, dan histori approval yang bisa diaudit ketika angka laporan berubah.",
    solutionBuilt:
      "Saya menyusun dashboard modular yang menggabungkan ringkasan KPI, queue exception, approval berjenjang, dan export laporan harian tanpa memaksa user berpindah-pindah view hanya untuk memahami kondisi operasional saat itu juga.",
    roleLabel: "Backend-focused fullstack",
    roleSummary:
      "Peran saya difokuskan pada perancangan schema inti, API dashboard dan reporting, cache KPI, serta pengalaman admin yang tetap cepat dipakai supervisor maupun operator.",
    focusAreas: [
      "Snapshot KPI harian yang cepat dimuat",
      "Workflow approval dan audit perubahan angka",
      "Ekspor laporan tanpa query berat berulang",
    ],
    architectureHighlights: [
      "Modul transaksi, approval, dan reporting snapshot dipisah agar dashboard tidak membaca tabel operasional mentah setiap render.",
      "Redis dipakai untuk cache KPI dan ringkasan antrean yang sering dibuka supervisor pada jam operasional sibuk.",
      "Role-based access diterapkan di level route dan policy agar aksi sensitif tidak bercampur antara operator, reviewer, dan approver.",
    ],
    decisionNotes: [
      "Pre-aggregation dipilih untuk KPI harian agar halaman utama tetap cepat saat volume data tumbuh.",
      "Audit trail dibuat append-only supaya histori perubahan status dan angka laporan tetap bisa ditelusuri.",
      "Filter laporan dibatasi ke kombinasi yang paling sering dipakai agar UX ekspor tetap ringan dan query tidak liar.",
    ],
    lessonsLearned:
      "Dashboard internal yang efektif bukan soal jumlah widget, tetapi seberapa cepat user bisa tahu apa yang bermasalah hari ini, siapa yang harus menindaklanjuti, dan laporan apa yang perlu diekspor tanpa bantuan tim teknis.",
    body:
      "## Ruang lingkup case study\n\nOperational Dashboard dirancang untuk skenario operasi harian yang bergerak cepat: user perlu melihat KPI, menemukan anomali, memeriksa item yang tertunda, lalu mengambil aksi tanpa pindah ke banyak halaman. Fokusnya adalah membuat halaman utama benar-benar menjadi workspace keputusan, bukan hanya layar statistik.\n\n## Keputusan arsitektur\n\nData transaksi detail tetap berada di modul sumber, sedangkan dashboard membaca snapshot dan agregasi yang disiapkan khusus untuk kebutuhan monitoring. Pendekatan ini menjaga halaman utama tetap cepat, mengurangi query berat berulang, dan membuat logika reporting lebih mudah diuji.\n\n## Fokus performa dan integritas\n\nExport laporan tidak mengambil semua transformasi dari sisi client. Format laporan dibangun dari endpoint yang sudah memiliki kontrak tetap, sehingga angka yang dilihat di dashboard dan angka yang diekspor tetap konsisten. Validasi input, approval trail, dan pembatasan akses per role juga dijadikan bagian dari struktur, bukan tambahan belakangan.",
    tutorial:
      "Mulai dari tiga hal: sumber data yang benar, KPI yang benar-benar dipakai tim, dan keputusan apa yang harus bisa diambil dari halaman utama. Setelah itu, susun snapshot reporting, queue exception, dan approval flow sebagai modul terpisah. Pendekatan ini membuat dashboard tetap cepat dipakai walau kebutuhan pelaporan terus bertambah.",
    thumbnail: "/projects/operational-dashboard.svg",
    thumbnailAlt: "Ilustrasi dashboard operasional bergaya dark premium",
    techStack: ["Laravel", "Next.js", "MySQL", "Redis"],
    features: [
      "Role-based access",
      "Export laporan",
      "Dashboard KPI",
      "Validasi data terstruktur",
    ],
    featured: true,
    published: true,
    updatedAt: "2026-03-24T00:00:00.000Z",
    tutorialUrl: "/blog",
  },
  {
    slug: "service-management-suite",
    name: "Service Management Suite",
    category: "Internal Operations",
    summary:
      "Sistem layanan untuk intake request, assignment, SLA tracking, approval, dan audit trail yang tetap rapi saat volume tiket bertambah.",
    description:
      "Project ini mewakili operasi layanan internal yang sebelumnya sulit dilacak karena status, penugasan, dan histori perubahan tersebar di banyak kanal komunikasi.",
    problemContext:
      "Masalah utama di sistem layanan biasanya muncul ketika request masuk dari banyak arah, status dikelola secara longgar, dan setiap perubahan tidak punya konteks yang bisa diaudit. Akibatnya SLA sulit diukur dan tim support kehilangan visibilitas atas bottleneck.",
    solutionBuilt:
      "Saya merancang suite layanan yang memusatkan intake request, assignment, status transition yang eksplisit, SLA timer, dan histori aktivitas sehingga setiap tiket punya alur yang bisa dibaca ulang tanpa menebak-nebak.",
    roleLabel: "Backend engineer",
    roleSummary:
      "Saya memfokuskan pekerjaan pada desain state machine layanan, kontrak API, schema PostgreSQL, audit trail, serta query list/detail yang tetap stabil untuk tim operasional.",
    focusAreas: [
      "State transition yang eksplisit",
      "Audit trail untuk setiap perubahan layanan",
      "Query list dan detail yang stabil untuk tim operasional",
    ],
    architectureHighlights: [
      "Lifecycle request dipisah menjadi modul intake, assignment, execution, dan closure agar setiap transisi punya aturan yang jelas.",
      "PostgreSQL dipakai untuk menjaga integritas data layanan, sedangkan GORM hanya membungkus operasi yang memang repetitif.",
      "Riwayat aktivitas disimpan sebagai event terstruktur agar approval, reassign, dan reopening tiket tetap bisa ditelusuri.",
    ],
    decisionNotes: [
      "Status dibuat eksplisit dan terbatas agar business rule tidak bocor ke banyak handler atau job terpisah.",
      "Endpoint list dan detail dipisah supaya query tabel operasional tidak membebani halaman dengan kebutuhan agregasi berbeda.",
      "Audit log dianggap bagian inti sistem, bukan pelengkap, karena tim service butuh histori yang bisa dipakai saat eskalasi.",
    ],
    lessonsLearned:
      "Sistem layanan yang sehat membutuhkan bahasa status yang jelas. Begitu transisi dibuat eksplisit, backlog, SLA, dan bottleneck jauh lebih mudah dipantau dan diperbaiki.",
    body:
      "## Masalah yang diselesaikan\n\nService Management Suite tidak diposisikan sebagai aplikasi ticketing generik, tetapi sebagai studi kasus untuk operasi layanan yang butuh kontrol status yang ketat, jejak aktivitas yang utuh, dan antarmuka admin yang tetap nyaman dipakai saat volume request naik.\n\n## Arsitektur delivery\n\nUse case utama dibangun di sekitar aturan transisi status. Handler hanya menangani parsing request dan response, sedangkan rule seperti kapan tiket boleh di-approve, di-assign ulang, atau dibuka kembali diletakkan di service layer. Pola ini menjaga logika layanan tetap bisa diuji tanpa bergantung pada HTTP.\n\n## Integritas data dan audit\n\nSetiap perubahan penting memicu pencatatan aktivitas yang terstruktur. Ini membuat tim bisa menelusuri siapa yang mengubah tiket, kapan SLA terganggu, dan di titik mana request mulai macet. Untuk aplikasi layanan, kemampuan membaca ulang histori seperti ini sering jauh lebih penting daripada UI yang terlihat sibuk.",
    tutorial:
      "Mulai dari definisi lifecycle layanan: request masuk, diverifikasi, ditugaskan, dikerjakan, ditutup, atau dibuka ulang. Setelah itu, pastikan setiap transisi punya rule, actor yang jelas, dan event audit yang tercatat. Ini membuat alur layanan tetap dapat dijelaskan saat volume operasional meningkat.",
    thumbnail: "/projects/service-management-suite.svg",
    thumbnailAlt: "Ilustrasi sistem manajemen layanan dengan panel modern",
    techStack: ["Go", "Gin", "GORM", "PostgreSQL"],
    features: [
      "Tracking status layanan",
      "Audit trail",
      "API modular",
      "Query yang dioptimalkan",
    ],
    featured: true,
    published: true,
    updatedAt: "2026-03-24T00:00:00.000Z",
    tutorialUrl: "/blog",
  },
  {
    slug: "knowledge-base-portal",
    name: "Knowledge Base Portal",
    category: "Content Platform",
    summary:
      "Portal dokumentasi dan tutorial berslug yang membantu pengguna menemukan panduan, artikel terkait, dan jalur belajar tanpa mentok di satu halaman.",
    description:
      "Project ini berangkat dari kebutuhan produk yang dokumentasinya tersebar di chat, PDF, dan catatan internal sehingga pengguna kesulitan menemukan jawaban yang konsisten.",
    problemContext:
      "Ketika dokumentasi tersebar di banyak kanal, tim support harus mengulang jawaban yang sama, pengguna kesulitan mencari topik yang tepat, dan halaman artikel yang ada tidak membentuk jalur eksplorasi yang rapi.",
    solutionBuilt:
      "Saya membangun struktur portal berbasis artikel, kategori, tag, search, dan related content agar dokumentasi terasa seperti sistem konten yang hidup, bukan kumpulan halaman statis yang berdiri sendiri.",
    roleLabel: "Fullstack developer",
    roleSummary:
      "Fokus saya ada pada perancangan route App Router, metadata SEO, rendering markdown, modul discovery, dan admin workflow yang tetap nyaman dipakai untuk menambah artikel baru.",
    focusAreas: [
      "Routing dan taxonomy SEO-aware",
      "Search discovery untuk artikel teknis",
      "Rendering markdown yang konsisten antara preview dan publik",
    ],
    architectureHighlights: [
      "Setiap artikel memiliki slug, metadata, dan internal linking agar jalur archive → detail → related content selalu hidup.",
      "Taxonomy diperlakukan sebagai route publik yang nyata, bukan sekadar label visual di card artikel.",
      "Renderer markdown, preview admin, dan halaman publik disatukan agar pengalaman authoring tetap konsisten.",
    ],
    decisionNotes: [
      "Halaman search dibuat noindex agar tidak menghasilkan halaman tipis dengan query yang tidak stabil untuk crawler.",
      "Related article diprioritaskan oleh kategori dan overlap tag supaya pembaca tetap berada di topik yang paling dekat.",
      "Sidebar kanan dipakai untuk search, taxonomy, latest, dan TOC agar area itu menjadi alat navigasi, bukan dekorasi kosong.",
    ],
    lessonsLearned:
      "Dokumentasi yang baik tidak hanya menjawab satu pertanyaan, tetapi juga membantu pembaca menemukan pertanyaan berikutnya tanpa harus kembali ke mesin pencari.",
    body:
      "## Tujuan sistem konten\n\nKnowledge Base Portal dirancang untuk konteks di mana dokumentasi bukan lagi pelengkap, tetapi bagian dari pengalaman produk. Pengguna datang dari hasil pencarian, dari link di dashboard, atau dari artikel lain, sehingga setiap halaman harus mampu berdiri sendiri sekaligus mengarahkan pembaca ke topik berikutnya.\n\n## Struktur discovery\n\nArchive, taxonomy, search, related posts, dan prev/next navigation disusun sebagai satu sistem discovery. Ini penting karena nilai dokumentasi teknis sering muncul bukan hanya dari satu artikel, tetapi dari kemampuan pengguna menjelajahi topik yang berkaitan secara cepat.\n\n## Konsistensi rendering\n\nMarkdown dipilih karena sederhana untuk authoring dan stabil untuk versioning. Namun nilai utamanya muncul ketika preview admin dan public rendering memakai pipeline yang sama. Dengan begitu, editor tahu persis bagaimana heading, code block, list, dan internal link akan muncul saat dipublikasikan.",
    tutorial:
      "Mulai dari taxonomy yang masuk akal, lalu susun archive, related content, dan search sebagai jalur yang saling menguatkan. Hindari menggabungkan semua dokumentasi ke satu halaman panjang. Konten akan jauh lebih mudah dijelajahi ketika setiap artikel punya fokus tunggal dan internal linking yang jelas.",
    thumbnail: "/projects/knowledge-base-portal.svg",
    thumbnailAlt: "Ilustrasi portal dokumentasi dengan layout editorial modern",
    techStack: ["Next.js", "TypeScript", "MDX-ready", "SEO metadata"],
    features: [
      "Struktur artikel SEO-friendly",
      "Kategori dan tag",
      "Metadata lengkap",
      "Navigasi konten yang mudah dipindai",
    ],
    featured: true,
    published: true,
    updatedAt: "2026-03-24T00:00:00.000Z",
    tutorialUrl: "/blog",
  },
  {
    slug: "analytics-reporting-workbench",
    name: "Analytics Reporting Workbench",
    category: "Reporting & Analytics",
    summary:
      "Workbench analitik untuk merangkum data operasional menjadi laporan yang bisa diverifikasi, diekspor, dan dipakai mengambil keputusan lebih cepat.",
    description:
      "Project ini berangkat dari kebutuhan reporting ketika tim masih menggabungkan data dari beberapa sumber secara manual sebelum menyusun laporan mingguan atau bulanan.",
    problemContext:
      "Masalah utama reporting biasanya muncul ketika definisi metrik tidak seragam, data mentah perlu dibersihkan manual, dan export spreadsheet tidak selalu selaras dengan angka yang dilihat di dashboard.",
    solutionBuilt:
      "Saya merancang workbench yang memusatkan agregasi metrik, validasi data, tabel eksplorasi, dan export laporan sehingga tim operasional bisa memverifikasi angka sebelum membagikannya ke stakeholder lain.",
    roleLabel: "Backend & data workflow",
    roleSummary:
      "Pekerjaan saya berfokus pada desain struktur data reporting, endpoint agregasi, workflow validasi, dan keluaran spreadsheet yang tetap konsisten dengan source of truth di backend.",
    focusAreas: [
      "Pipeline agregasi dan validasi data",
      "Ekspor spreadsheet yang konsisten",
      "Ringkasan KPI yang mudah diverifikasi tim non-teknis",
    ],
    architectureHighlights: [
      "Layer agregasi dipisahkan dari tabel sumber agar rumus reporting tidak tersebar di banyak endpoint.",
      "Spreadsheet export dibangun dari dataset yang sama dengan dashboard untuk mencegah selisih angka antar-output.",
      "Workflow validasi disusun sebelum data dipublish ke ringkasan utama agar tim bisa menandai anomali lebih awal.",
    ],
    decisionNotes: [
      "Definisi metrik dibuat eksplisit agar perubahan rumus tidak diam-diam memengaruhi laporan historis.",
      "Tampilan tabel dioptimalkan untuk scan cepat, sedangkan perhitungan berat dipindahkan ke backend.",
      "Integrasi spreadsheet dipertahankan karena ini format kerja tim operasional, tetapi sumber kebenaran tetap berada di aplikasi.",
    ],
    lessonsLearned:
      "Sistem reporting yang dipercaya user lahir dari definisi data yang konsisten, bukan dari visualisasi yang paling ramai.",
    body:
      "## Fokus studi kasus\n\nAnalytics Reporting Workbench dibangun untuk skenario saat tim perlu berpindah dari reporting manual menuju workflow yang lebih repeatable. Hal paling penting bukan sekadar menampilkan chart, tetapi memastikan angka yang dipakai tim operasional, finance, atau stakeholder lain berasal dari definisi yang sama.\n\n## Pendekatan teknis\n\nData mentah dibersihkan dan diringkas lebih dulu sebelum dipakai di dashboard. Ini membuat query halaman lebih stabil dan mengurangi risiko rumus yang berbeda-beda antara satu tampilan dengan export. Untuk sistem reporting, konsistensi antar-output sering lebih penting daripada jumlah grafik yang tersedia.\n\n## Kualitas data sebelum visualisasi\n\nSalah satu keputusan penting di studi kasus ini adalah menempatkan validasi dan verifikasi data sebagai bagian eksplisit dari workflow. Dengan begitu, user tidak hanya menerima angka, tetapi juga punya jalur untuk mengecek apakah sumbernya sudah lengkap dan layak dipakai untuk pengambilan keputusan.",
    tutorial:
      "Mulai dari definisi metrik, sumber data, dan aturan validasi yang dipakai tim. Setelah itu baru susun agregasi, dashboard, dan export. Reporting yang baik selalu dibangun dari definisi data yang stabil, bukan dari chart yang dibuat paling akhir.",
    thumbnail: "/projects/analytics-reporting-workbench.svg",
    thumbnailAlt: "Ilustrasi workspace analitik dan reporting dengan nuansa premium",
    techStack: ["PHP", "Spreadsheet", "MySQL", "REST API"],
    features: [
      "Integrasi data tabular",
      "Ringkasan performa",
      "Ekspor spreadsheet",
      "Data validation workflow",
    ],
    featured: false,
    published: true,
    updatedAt: "2026-03-24T00:00:00.000Z",
    tutorialUrl: "/blog",
  },
];

export const articles: ArticleItem[] = [
  {
    slug: "membangun-portfolio-content-system-dengan-nextjs-app-router",
    title: "Membangun Portfolio Content System dengan Next.js App Router",
    summary:
      "Catatan teknis tentang bagaimana portfolio ini berkembang dari landing page menjadi sistem konten dengan blog, projects, admin CMS, discovery layer, dan SEO production.",
    category: "Next.js",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Project ini awalnya dimulai sebagai landing page portfolio biasa, tetapi cepat terasa kurang cukup karena pengunjung hanya datang ke satu halaman lalu mentok.\n\n## Dari showcase ke content system\n\nSaya ingin portfolio ini bisa menjelaskan lebih dari sekadar profil. Karena itu, blog, projects, taxonomy, search, dan related content saya perlakukan sebagai satu sistem discovery yang saling mendukung. Pengunjung harus bisa masuk dari artikel, dari case study, atau dari halaman archive, lalu tetap punya jalur eksplorasi yang jelas.\n\n## Admin bukan bagian publik\n\nSalah satu keputusan penting adalah memisahkan shell admin dari navigasi publik. Workspace admin harus terasa seperti alat kerja: padat, jelas, cepat dipakai, dan tidak ikut terbawa gaya landing page. Dari situ, blog editor, project editor, audit viewer, dan messages bisa berkembang dengan bahasa UX yang lebih tepat.\n\n## SEO dan rendering harus sengaja dirancang\n\nSaya juga sengaja membuat metadata dinamis, sitemap, robots, JSON-LD, dan canonical URL sebagai bagian dari fondasi. Untuk konten teknis, pipeline markdown dibuat konsisten antara preview admin dan halaman publik agar authoring, rendering, dan discovery tetap sejalan.\n\n## Pelajaran utamanya\n\nPortfolio yang matang bukan hanya tampak rapi di halaman utama. Ia harus punya struktur konten, discovery flow, dan operasi admin yang cukup kuat untuk tumbuh menjadi sistem publik yang benar-benar berguna.",
    tags: ["nextjs", "content-system", "seo", "admin", "architecture"],
    published: true,
    href: "/blog/membangun-portfolio-content-system-dengan-nextjs-app-router",
  },
  {
    slug: "merancang-dashboard-operasional-yang-bisa-dipakai-tim-setiap-pagi",
    title: "Merancang Dashboard Operasional yang Bisa Dipakai Tim Setiap Pagi",
    summary:
      "Panduan merancang dashboard operasional yang fokus pada keputusan harian, KPI yang benar-benar dipakai, dan alur exception yang bisa ditindak tanpa berpindah-pindah layar.",
    category: "Architecture",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Dashboard operasional yang benar-benar dipakai tim setiap pagi biasanya lahir dari kebutuhan keputusan, bukan dari daftar widget yang ingin ditampilkan sekaligus.\n\n## Mulai dari keputusan, bukan widget\n\nLangkah pertama adalah menentukan pertanyaan apa yang harus terjawab dalam 30 detik pertama setelah halaman dibuka. KPI apa yang harus terlihat? Exception mana yang wajib ditindak? Siapa yang perlu melakukan approval? Dengan urutan seperti ini, struktur halaman akan mengikuti alur kerja, bukan sekadar menumpuk angka di layar.\n\n## Pisahkan snapshot dari data transaksi mentah\n\nBegitu dashboard mulai memuat banyak agregasi sekaligus, membaca tabel transaksi mentah pada setiap render biasanya menjadi bottleneck. Saya lebih memilih menyiapkan snapshot atau layer agregasi yang memang dirancang untuk kebutuhan monitoring. Pendekatan ini membuat loading lebih stabil dan memudahkan audit ketika angka berubah.\n\n## Audit perubahan angka sejak awal\n\nUntuk dashboard yang memengaruhi keputusan operasional, histori perubahan tidak boleh menjadi tambahan belakangan. Jika ada approval, override, atau koreksi data, sistem harus bisa menjelaskan siapa yang mengubah angka, kapan perubahan terjadi, dan data apa yang dipakai sebagai sumber saat itu. Inilah yang membuat dashboard terasa dapat dipercaya, bukan sekadar terlihat rapi.",
    tags: ["dashboard", "architecture", "operations"],
    published: true,
    href: "/blog/merancang-dashboard-operasional-yang-bisa-dipakai-tim-setiap-pagi",
  },
  {
    slug: "state-transition-yang-sehat-untuk-sistem-layanan-internal",
    title: "State Transition yang Sehat untuk Sistem Layanan Internal",
    summary:
      "Cara merancang lifecycle request, status, SLA, dan audit trail agar sistem layanan internal tetap jelas, dapat diuji, dan tidak bocor business rule ke banyak handler.",
    category: "Backend",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Masalah terbesar di banyak sistem layanan internal bukan ada pada UI, tetapi pada status yang longgar dan perubahan state yang tidak punya aturan tegas.\n\n## Status harus punya arti yang jelas\n\nSetiap status perlu menjawab apa yang sedang terjadi, siapa aktor yang boleh mengubahnya, dan langkah berikutnya apa. Kalau satu status dipakai untuk terlalu banyak kondisi, tim support akan sulit membaca backlog dan SLA akan cepat kehilangan makna.\n\n## Pisahkan lifecycle dari handler HTTP\n\nBusiness rule seperti kapan tiket boleh ditutup, kapan perlu approval, atau kapan request bisa dibuka ulang sebaiknya tidak hidup di controller. Saya lebih memilih menaruh rule transisi di service layer atau use case sehingga alurnya dapat diuji tanpa bergantung pada HTTP.\n\n## Audit trail bukan fitur tambahan\n\nBegitu volume request naik, histori perubahan menjadi alat utama untuk membaca bottleneck dan eskalasi. Audit trail yang baik membantu tim melihat siapa yang mengambil alih tiket, kapan SLA mulai terganggu, dan titik mana yang paling sering menunda delivery. Untuk sistem layanan, ini lebih penting daripada sekadar punya daftar status yang panjang.",
    tags: ["backend", "service-management", "state-machine"],
    published: true,
    href: "/blog/state-transition-yang-sehat-untuk-sistem-layanan-internal",
  },
  {
    slug: "membangun-knowledge-base-yang-searchable-dan-seo-aware",
    title: "Membangun Knowledge Base yang Searchable dan SEO-Aware",
    summary:
      "Panduan menyusun archive, taxonomy, search, dan internal linking agar knowledge base terasa hidup, mudah dijelajahi, dan tetap nyaman dikelola saat kontennya bertambah.",
    category: "Documentation",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Knowledge base yang baik tidak membuat pembaca berhenti di satu halaman. Ia membantu pengguna menemukan jawaban pertama, lalu mengarahkan mereka ke topik berikutnya yang masih relevan.\n\n## Setiap artikel harus punya peran\n\nSaya memisahkan artikel pengenalan, tutorial langkah demi langkah, dan referensi teknis karena kebutuhan pembaca tidak selalu sama. Dengan peran yang jelas, archive dan search menjadi jauh lebih berguna daripada sekadar kumpulan judul.\n\n## Taxonomy adalah navigasi, bukan label dekoratif\n\nKategori dan tag seharusnya menjadi jalur eksplorasi yang nyata. Itu berarti setiap taxonomy page perlu punya konteks, listing konten, dan hubungan yang masuk akal dengan artikel lain. Jika taxonomy hanya muncul sebagai chip di card, nilainya untuk discovery sangat terbatas.\n\n## Search dan related content harus saling menguatkan\n\nSearch membantu pembaca yang datang dengan intent spesifik, sedangkan related content membantu mereka yang mulai dari satu artikel lalu ingin memperdalam topik. Ketika dua jalur ini bekerja bersama, knowledge base terasa seperti sistem konten yang hidup dan bukan sekadar tumpukan dokumentasi lama.",
    tags: ["documentation", "seo", "content-system"],
    published: true,
    href: "/blog/membangun-knowledge-base-yang-searchable-dan-seo-aware",
  },
];

export const seedContentNote =
  "Konten di situs ini menggabungkan project yang saya bangun langsung, studi kasus sistem internal, dan artikel teknis yang memperlihatkan cara saya merancang discovery, kualitas implementasi, dan keputusan engineering secara lebih konkret.";
