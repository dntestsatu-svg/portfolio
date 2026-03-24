import { z } from "zod";
import { SUPPORT_MAX_AMOUNT, SUPPORT_MIN_AMOUNT } from "@/lib/support-shared";

const urlField = z
  .union([z.literal(""), z.string().url("URL tidak valid."), z.undefined(), z.null()])
  .transform((value) => value || undefined);

const commaSeparatedList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => {
    const items = Array.isArray(value) ? value : value.split(",");

    return items.map((item) => item.trim()).filter(Boolean);
  });

const publishBoolean = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean(), z.undefined()])
  .transform((value) => value === true || value === "on" || value === "true");

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Email tidak valid."),
  subject: z.string().min(3, "Topik minimal 3 karakter."),
  message: z.string().min(20, "Pesan minimal 20 karakter."),
  company: z.string().optional().default(""),
}).superRefine((value, context) => {
  if (value.company.trim().length > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["company"],
      message: "Submission terdeteksi sebagai spam.",
    });
  }

  const wordCount = value.message.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["message"],
      message: "Pesan minimal terdiri dari 3 kata yang bermakna.",
    });
  }

  const urlCount = (value.message.match(/https?:\/\/|www\./gi) ?? []).length;
  if (urlCount > 2) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["message"],
      message: "Terlalu banyak tautan di dalam pesan.",
    });
  }
});

export const projectInputSchema = z.object({
  title: z.string().min(3, "Judul project minimal 3 karakter."),
  slug: z.string().optional().default(""),
  category: z.string().min(2, "Kategori wajib diisi."),
  summary: z.string().min(12, "Ringkasan terlalu pendek."),
  description: z.string().min(20, "Deskripsi terlalu pendek."),
  body: z.string().min(40, "Detail project terlalu pendek."),
  tutorial: z.string().optional().default(""),
  demoUrl: urlField,
  repoUrl: urlField,
  techStack: commaSeparatedList,
  features: commaSeparatedList,
  published: publishBoolean,
  featured: publishBoolean,
});

export const blogInputSchema = z.object({
  title: z.string().min(3, "Judul artikel minimal 3 karakter."),
  slug: z.string().optional().default(""),
  category: z.string().min(2, "Kategori wajib diisi."),
  summary: z.string().min(12, "Ringkasan terlalu pendek."),
  content: z.string().min(40, "Konten artikel terlalu pendek."),
  tags: commaSeparatedList,
  published: publishBoolean,
});

export const supportGenerateSchema = z.object({
  amount: z.coerce
    .number()
    .int("Nominal harus bilangan bulat.")
    .min(SUPPORT_MIN_AMOUNT, "Nominal minimal Rp10.000.")
    .max(SUPPORT_MAX_AMOUNT, "Nominal maksimal Rp10.000.000."),
  supporterName: z
    .string()
    .trim()
    .min(2, "Nama tampilan minimal 2 karakter.")
    .max(80, "Nama tampilan maksimal 80 karakter."),
  isAnonymous: z.boolean().optional().default(false),
  message: z
    .string()
    .trim()
    .max(180, "Pesan dukungan maksimal 180 karakter.")
    .optional()
    .default(""),
  showOnLeaderboard: z.boolean().optional().default(false),
});

export const goqrWebhookSchema = z.object({
  amount: z.coerce.number().int().positive("Amount wajib lebih dari 0."),
  terminal_id: z.string().trim().min(1, "terminal_id wajib diisi."),
  merchant_id: z.string().trim().min(1, "merchant_id wajib diisi."),
  trx_id: z.string().trim().min(1, "trx_id wajib diisi."),
  rrn: z.string().trim().optional().default(""),
  custom_ref: z.string().trim().optional().default(""),
  vendor: z.string().trim().optional().default(""),
  status: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => ["success", "failed", "expired", "pending"].includes(value), {
      message: "Status webhook tidak dikenali.",
    }),
  created_at: z.string().trim().optional().default(""),
  finish_at: z.string().trim().optional().default(""),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.output<typeof projectInputSchema>;
export type BlogInput = z.output<typeof blogInputSchema>;
export type SupportGenerateInput = z.output<typeof supportGenerateSchema>;
export type GoqrWebhookInput = z.output<typeof goqrWebhookSchema>;
