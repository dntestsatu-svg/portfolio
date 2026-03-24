import Link from "next/link";
import {
  auditActionOptions,
  auditEntityTypeOptions,
  getAdminAuditActionLabel,
  getAdminAuditEntityLabel,
  getAuditLifecyclePolicy,
  getAdminAuditLogPage,
} from "@/lib/services/audit-log";

type AdminAuditPageProps = {
  searchParams: Promise<{
    page?: string;
    action?: string;
    entityType?: string;
  }>;
};

function getPageNumber(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildAuditHref(filters: {
  page?: number;
  action?: string;
  entityType?: string;
}) {
  const params = new URLSearchParams();

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  const query = params.toString();
  return query ? `/admin/audit?${query}` : "/admin/audit";
}

function buildAuditExportHref(filters: {
  action?: string;
  entityType?: string;
  days: number;
}) {
  const params = new URLSearchParams();
  params.set("days", String(filters.days));

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  return `/admin/audit/export?${params.toString()}`;
}

function formatAuditTimestamp(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const query = await searchParams;
  const policy = getAuditLifecyclePolicy();
  const auditPage = await getAdminAuditLogPage({
    page: getPageNumber(query.page),
    action: query.action,
    entityType: query.entityType,
  });
  const exportHref = buildAuditExportHref({
    action: auditPage.filters.action,
    entityType: auditPage.filters.entityType,
    days: policy.exportDefaultDays,
  });

  return (
    <section className="space-y-6">
      <article className="surface-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Audit log</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Observability aktivitas admin</h2>
            <p className="copy-muted mt-3 max-w-3xl text-sm">
              Viewer ini bersifat read-only, hanya memuat ringkasan event yang relevan untuk
              operasional admin, dan tidak mengekspos body request, password, CSRF token, atau
              payload sensitif lain.
            </p>
            <p className="copy-muted mt-3 max-w-3xl text-sm">
              Retention aktif: {policy.retentionDays} hari. Export dibatasi sampai{" "}
              {policy.exportMaxRows} baris untuk {policy.exportMaxDays} hari terakhir.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
              Total event tersimpan:{" "}
              <span className="font-semibold text-white">{auditPage.totalCount}</span>
            </div>
            <Link href={exportHref} className="button-secondary">
              Export {policy.exportDefaultDays} hari terakhir
            </Link>
          </div>
        </div>

        <form method="get" className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="grid gap-2">
            <label htmlFor="action" className="text-sm font-medium text-slate-200">
              Filter action
            </label>
            <select
              id="action"
              name="action"
              className="field-select"
              defaultValue={auditPage.filters.action}
            >
              <option value="">Semua action</option>
              {auditActionOptions.map((action) => (
                <option key={action} value={action}>
                  {getAdminAuditActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="entityType" className="text-sm font-medium text-slate-200">
              Filter entitas
            </label>
            <select
              id="entityType"
              name="entityType"
              className="field-select"
              defaultValue={auditPage.filters.entityType}
            >
              <option value="">Semua entitas</option>
              {auditEntityTypeOptions.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {getAdminAuditEntityLabel(entityType)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button type="submit" className="button-primary">
              Terapkan filter
            </button>
            <Link href="/admin/audit" className="button-secondary">
              Reset
            </Link>
          </div>
        </form>
      </article>

      <div className="grid gap-4">
        {auditPage.items.length > 0 ? (
          auditPage.items.map((item) => (
            <article key={item.id} className="surface-panel rounded-[2rem] p-6">
              <div className="flex flex-wrap gap-2">
                <span className="tag-chip-subtle">{getAdminAuditActionLabel(item.action)}</span>
                <span className="tag-chip-subtle">{getAdminAuditEntityLabel(item.entityType)}</span>
                <span className="tag-chip-subtle">{formatAuditTimestamp(item.createdAt)}</span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-white">
                {item.entityLabel ?? "Peristiwa autentikasi admin"}
              </h3>

              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="copy-muted">Actor / identifier</dt>
                  <dd className="mt-1 text-slate-100">{item.actorEmail}</dd>
                </div>

                <div>
                  <dt className="copy-muted">IP address</dt>
                  <dd className="mt-1 text-slate-100">{item.ipAddress ?? "Tidak tersedia"}</dd>
                </div>

                {item.metadataSummary.length > 0 ? (
                  <div className="md:col-span-2">
                    <dt className="copy-muted">Metadata ringkas</dt>
                    <dd className="mt-3 flex flex-wrap gap-2">
                      {item.metadataSummary.map((entry) => (
                        <span
                          key={`${item.id}-${entry.label}-${entry.value}`}
                          className="tag-chip-subtle"
                        >
                          {entry.label}: {entry.value}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </article>
          ))
        ) : (
          <article className="surface-panel rounded-[2rem] p-6">
            <p className="copy-muted text-sm">
              Belum ada event audit yang cocok dengan filter saat ini.
            </p>
          </article>
        )}
      </div>

      <nav
        aria-label="Pagination audit log"
        className="surface-panel flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between"
      >
        <p className="copy-muted text-sm">
          Halaman {auditPage.page} dari {auditPage.totalPages}. Menampilkan hingga{" "}
          {auditPage.pageSize} event per halaman.
        </p>

        <div className="flex flex-wrap gap-3">
          {auditPage.page > 1 ? (
            <Link
              href={buildAuditHref({
                page: auditPage.page - 1,
                action: auditPage.filters.action,
                entityType: auditPage.filters.entityType,
              })}
              className="button-secondary"
            >
              Halaman sebelumnya
            </Link>
          ) : null}

          {auditPage.page < auditPage.totalPages ? (
            <Link
              href={buildAuditHref({
                page: auditPage.page + 1,
                action: auditPage.filters.action,
                entityType: auditPage.filters.entityType,
              })}
              className="button-secondary"
            >
              Halaman berikutnya
            </Link>
          ) : null}
        </div>
      </nav>
    </section>
  );
}
