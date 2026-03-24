import Link from "next/link";
import {
  auditActionOptions,
  auditEntityTypeOptions,
  getAdminAuditActionLabel,
  getAdminAuditEntityLabel,
  getAdminAuditLogPage,
  getAuditLifecyclePolicy,
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
    <section className="admin-page">
      <header className="admin-panel admin-page-header">
        <div>
          <p className="admin-panel-label">Audit workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Observability aktivitas admin
          </h1>
          <p className="admin-copy-muted mt-3 max-w-3xl text-sm">
            Viewer ini bersifat read-only dan hanya menampilkan ringkasan event yang relevan untuk
            operasional. Payload sensitif seperti body request, password, cookie, dan CSRF token
            tetap tidak ditampilkan di sini.
          </p>
        </div>
        <div className="admin-actions">
          <Link href={exportHref} className="admin-button-secondary">
            Export {policy.exportDefaultDays} hari
          </Link>
        </div>
      </header>

      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <span className="admin-panel-label">Total event</span>
          <strong className="admin-stat-value">{auditPage.totalCount}</strong>
          <span className="admin-help">Jumlah event yang cocok dengan filter saat ini.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Retention</span>
          <strong className="admin-stat-value">{policy.retentionDays}h</strong>
          <span className="admin-help">Audit log lama akan dipangkas sesuai retention policy.</span>
        </article>
        <article className="admin-stat-card">
          <span className="admin-panel-label">Export limit</span>
          <strong className="admin-stat-value">{policy.exportMaxRows}</strong>
          <span className="admin-help">
            Maksimum baris untuk {policy.exportMaxDays} hari terakhir.
          </span>
        </article>
      </section>

      <section className="admin-panel">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="admin-panel-label">Filters</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Saring event audit</h2>
          </div>
          <p className="admin-help">Gunakan filter untuk mempersempit observasi operasional.</p>
        </div>

        <form method="get" className="admin-filter-grid mt-4">
          <div className="grid gap-2">
            <label htmlFor="action" className="admin-label">
              Action
            </label>
            <select
              id="action"
              name="action"
              className="admin-select"
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
            <label htmlFor="entityType" className="admin-label">
              Entitas
            </label>
            <select
              id="entityType"
              name="entityType"
              className="admin-select"
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

          <div className="admin-actions admin-actions-end">
            <button type="submit" className="admin-button-primary">
              Terapkan filter
            </button>
            <Link href="/admin/audit" className="admin-button-secondary">
              Reset
            </Link>
          </div>
        </form>
      </section>

      {auditPage.items.length > 0 ? (
        <section className="admin-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-panel-label">Audit events</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Daftar event</h2>
            </div>
            <p className="admin-help">
              Halaman {auditPage.page} dari {auditPage.totalPages}, maksimal {auditPage.pageSize}{" "}
              event per halaman.
            </p>
          </div>

          <div className="admin-list mt-4">
            {auditPage.items.map((item) => (
              <article key={item.id} className="admin-list-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="admin-meta-chip">{getAdminAuditActionLabel(item.action)}</span>
                    <span className="admin-meta-chip">
                      {getAdminAuditEntityLabel(item.entityType)}
                    </span>
                    <span className="admin-meta-chip">{formatAuditTimestamp(item.createdAt)}</span>
                  </div>

                  <h3 className="admin-list-title mt-3">
                    {item.entityLabel ?? "Peristiwa autentikasi admin"}
                  </h3>

                  <dl className="admin-key-value-grid mt-4">
                    <div>
                      <dt className="admin-key-label">Actor / identifier</dt>
                      <dd className="admin-key-value">{item.actorEmail}</dd>
                    </div>
                    <div>
                      <dt className="admin-key-label">IP address</dt>
                      <dd className="admin-key-value">{item.ipAddress ?? "Tidak tersedia"}</dd>
                    </div>
                  </dl>

                  {item.metadataSummary.length > 0 ? (
                    <dl className="mt-4">
                      <dt className="admin-key-label">Metadata ringkas</dt>
                      <dd className="mt-3 flex flex-wrap gap-2">
                        {item.metadataSummary.map((entry) => (
                          <span
                            key={`${item.id}-${entry.label}-${entry.value}`}
                            className="admin-meta-chip"
                          >
                            {entry.label}: {entry.value}
                          </span>
                        ))}
                      </dd>
                    </dl>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-empty-state">
          <p className="admin-panel-label">Tidak ada hasil</p>
          <h2 className="text-2xl font-semibold text-white">
            Belum ada event yang cocok dengan filter
          </h2>
          <p className="admin-copy-muted max-w-2xl text-sm">
            Coba longgarkan filter action atau entitas. Jika sistem masih baru, audit log memang
            bisa terlihat kosong sampai ada aktivitas admin yang tercatat.
          </p>
        </section>
      )}

      <nav aria-label="Pagination audit log" className="admin-panel admin-pagination">
        <p className="admin-help">
          Halaman {auditPage.page} dari {auditPage.totalPages}. Menampilkan hingga{" "}
          {auditPage.pageSize} event per halaman.
        </p>

        <div className="admin-actions">
          {auditPage.page > 1 ? (
            <Link
              href={buildAuditHref({
                page: auditPage.page - 1,
                action: auditPage.filters.action,
                entityType: auditPage.filters.entityType,
              })}
              className="admin-button-secondary"
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
              className="admin-button-secondary"
            >
              Halaman berikutnya
            </Link>
          ) : null}
        </div>
      </nav>
    </section>
  );
}
