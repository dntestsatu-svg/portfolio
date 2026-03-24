import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  buildAdminAuditExportCsv,
  getAdminAuditExportData,
} from "@/lib/services/audit-log";

export const runtime = "nodejs";

function getExportFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:]/g, "-").replace(/\..+$/, "");
  return `audit-log-${timestamp}.csv`;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");
  const entityType = request.nextUrl.searchParams.get("entityType");
  const days = request.nextUrl.searchParams.get("days");
  const limit = request.nextUrl.searchParams.get("limit");
  const exported = await getAdminAuditExportData({
    action,
    entityType,
    days,
    limit,
  });
  const csv = buildAdminAuditExportCsv(exported.items);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getExportFilename()}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
