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
    slug: "operational-dashboard",
    name: "Operational Dashboard",
    category: "Seed studi kasus",
    summary:
      "Struktur studi kasus untuk sistem operasional dengan dashboard, pelaporan, dan role-based workflow.",
    description:
      "Contoh format project ini disiapkan untuk menampilkan aplikasi operasional internal yang fokus pada kecepatan akses data, pelaporan yang rapi, dan alur kerja tim yang terstruktur.",
    body:
      "Operational Dashboard dirancang sebagai studi kasus untuk aplikasi internal yang membutuhkan visibilitas data cepat, modul pelaporan yang jelas, dan kontrol akses sesuai peran. Struktur ini cocok untuk menunjukkan bagaimana backend, dashboard, dan alur validasi saling terhubung dalam satu sistem.\n\nPada implementasi nyata, tipe project seperti ini biasanya membutuhkan desain database yang rapi, struktur API yang konsisten, dan kontrol kualitas agar data operasional tidak mudah rusak ketika volume penggunaan meningkat.",
    tutorial:
      "Mulai dengan mendefinisikan modul inti, peran pengguna, serta alur data utama. Setelah itu, susun API dan dashboard berdasarkan kebutuhan pelaporan, bukan hanya tampilan. Pendekatan ini menjaga sistem tetap relevan terhadap operasi harian.",
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
    category: "Seed studi kasus",
    summary:
      "Format portfolio untuk aplikasi layanan dengan pelacakan status, audit trail, dan alur kerja yang jelas.",
    description:
      "Template project ini cocok untuk menampilkan sistem yang mengelola request, approval, pelacakan progres, hingga dokumentasi aktivitas di sisi backend dan frontend.",
    body:
      "Service Management Suite mewakili tipe aplikasi yang menuntut alur status yang tertib, catatan aktivitas yang akurat, dan API yang cukup modular untuk berkembang. Fokus utamanya bukan sekadar CRUD, tetapi memastikan setiap perubahan status punya konteks yang jelas dan bisa diaudit.\n\nProject seperti ini sangat cocok untuk menunjukkan kekuatan backend engineering, terutama pada desain state, pemisahan tanggung jawab, dan kontrol integritas data.",
    tutorial:
      "Gunakan status yang eksplisit, audit trail yang konsisten, dan endpoint yang tidak ambigu. Hindari logika bisnis menyebar di terlalu banyak tempat agar alur layanan tetap mudah dilacak.",
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
    category: "Seed studi kasus",
    summary:
      "Portal dokumentasi dan tutorial untuk membantu pengguna memahami fitur, alur, dan penggunaan project secara cepat.",
    description:
      "Disusun sebagai contoh format untuk project yang membutuhkan dokumentasi publik, artikel tutorial, kategori konten, dan struktur SEO-friendly.",
    body:
      "Knowledge Base Portal difokuskan untuk kasus ketika produk membutuhkan dokumentasi publik yang rapi, halaman artikel dengan struktur yang bisa diindeks crawler, dan navigasi konten yang memudahkan user mencari jawaban.\n\nDi sisi teknis, project ini memperlihatkan kombinasi routing berslug, metadata yang lengkap, dan struktur konten yang nyaman dikelola dalam jangka panjang.",
    tutorial:
      "Pisahkan artikel ringkas, tutorial langkah demi langkah, dan referensi teknis. Struktur konten yang jelas lebih membantu pengguna daripada satu halaman dokumentasi yang terlalu padat.",
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
    category: "Seed studi kasus",
    summary:
      "Contoh project untuk analitik, tabel data, dan keluaran laporan yang akurat dan siap dipakai tim operasional.",
    description:
      "Format ini mewakili tipe aplikasi yang menggabungkan pengolahan data, dashboard, dan ringkasan kinerja untuk pengambilan keputusan yang lebih cepat.",
    body:
      "Analytics Reporting Workbench mewakili aplikasi yang banyak berinteraksi dengan tabel, kalkulasi, dan presentasi data. Ini relevan untuk menunjukkan pengalaman pada workflow reporting, ekspor data, dan kebutuhan ringkasan performa yang tetap mudah dipahami.\n\nTipe project ini juga menonjolkan kemampuan spreadsheet, integrasi backend, dan kebiasaan memikirkan kualitas data sebelum fokus pada visualisasi.",
    tutorial:
      "Mulai dari definisi metrik dan kualitas sumber data. Setelah itu barulah susun tampilan laporan, ekspor, dan agregasi agar hasil analitik tetap konsisten serta bisa dipercaya.",
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
    slug: "membangun-dashboard-yang-terstruktur",
    title: "Membangun Dashboard yang Terstruktur dan Mudah Dipelihara",
    summary:
      "Konten awal untuk menjelaskan cara menyusun modul dashboard, data flow, dan keputusan UI agar tetap rapi dalam jangka panjang.",
    category: "Architecture",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Dashboard yang baik tidak hanya terlihat rapi, tetapi juga memiliki alur data yang jelas, hirarki informasi yang tegas, dan batas tanggung jawab yang tidak kabur antara backend dan frontend.\n\nDalam praktiknya, saya lebih memilih memulai dari definisi kebutuhan operasional, sumber data, dan modul yang benar-benar penting. Setelah itu, tampilan mengikuti struktur informasi, bukan sebaliknya. Pendekatan ini membuat dashboard lebih mudah dipelihara dan tidak cepat kehilangan arah ketika kebutuhan berkembang.",
    tags: ["dashboard", "architecture", "maintainability"],
    published: true,
    href: "/blog/membangun-dashboard-yang-terstruktur",
  },
  {
    slug: "strategi-validasi-dan-keamanan-input",
    title: "Strategi Validasi Input dan Keamanan Dasar Aplikasi Web",
    summary:
      "Ruang untuk artikel yang membahas validasi, sanitasi, mitigasi serangan umum, dan kebiasaan engineering yang aman.",
    category: "Security",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Validasi input sebaiknya tidak diperlakukan sebagai lapisan tambahan yang ditempel belakangan. Ia perlu menjadi bagian dari desain request, struktur data, dan alur interaksi sejak awal.\n\nSaya terbiasa memikirkan validasi, sanitasi, SQL Injection mitigation, dan kebersihan alur autentikasi sebagai kebiasaan engineering dasar. Dengan begitu, kualitas sistem tidak bergantung pada satu titik pemeriksaan saja, tetapi tersebar secara proporsional di seluruh aplikasi.",
    tags: ["security", "validation", "backend"],
    published: true,
    href: "/blog/strategi-validasi-dan-keamanan-input",
  },
  {
    slug: "dokumentasi-project-yang-nyaman-dibaca",
    title: "Menulis Dokumentasi Project yang Nyaman Dibaca Pengguna",
    summary:
      "Contoh struktur artikel tutorial untuk membantu user memahami setup, fitur, dan alur penggunaan tanpa kebingungan.",
    category: "Documentation",
    publishedAt: "24 Maret 2026",
    publishedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtISO: "2026-03-24T00:00:00.000Z",
    updatedAtLabel: "24 Maret 2026",
    content:
      "Dokumentasi yang baik harus membantu pembaca memahami konteks, langkah penggunaan, dan kemungkinan kendala tanpa perlu menebak-nebak. Itu berarti struktur tulisan, istilah, dan urutan informasi harus sengaja disusun, bukan hanya dikumpulkan.\n\nSaya biasanya memisahkan artikel pengenalan, tutorial langkah demi langkah, dan referensi teknis agar pembaca bisa langsung masuk ke konteks yang mereka butuhkan. Pola ini juga membantu portfolio terasa lebih kredibel karena menjelaskan cara kerja, bukan hanya menampilkan hasil akhir.",
    tags: ["documentation", "tutorial", "ux-writing"],
    published: true,
    href: "/blog/dokumentasi-project-yang-nyaman-dibaca",
  },
];

export const seedContentNote =
  "Project dan artikel di situs ini ditata sebagai studi kasus, dokumentasi teknis, dan konten eksplorasi engineering agar pengunjung bisa memahami pendekatan kerja, kualitas implementasi, dan cara berpikir teknis yang saya bawa ke setiap produk.";
