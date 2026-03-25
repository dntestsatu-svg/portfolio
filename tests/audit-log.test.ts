import { describe, expect, test } from "bun:test";
import {
  buildAdminAuditExportCsv,
  getAuditMetadataSummary,
  hashAuditIdentifier,
  maskAuditIdentifier,
  normalizeAuditIdentifier,
} from "../lib/services/audit-log";

describe("audit log helpers", () => {
  test("normalizes and masks failed-login identifiers", () => {
    expect(normalizeAuditIdentifier("  mugi.nurul@Example.COM  ")).toBe(
      "mugi.nurul@example.com",
    );
    expect(maskAuditIdentifier("mugi.nurul@example.com")).toBe("mu***@e***.com");
    expect(maskAuditIdentifier("unknown")).toBe("unknown");
  });

  test("hashes failed-login identifiers deterministically", () => {
    expect(hashAuditIdentifier("mugi.nurul@example.com")).toBe(
      hashAuditIdentifier("  MUGI.NURUL@example.com "),
    );
    expect(hashAuditIdentifier("unknown")).toBeNull();
  });

  test("summarizes audit metadata without exposing raw payload", () => {
    const summary = getAuditMetadataSummary({
      failureCategory: "rate_limited_identifier",
      alertType: "failed_login_identifier_burst",
      threshold: 10,
      windowMinutes: 15,
      eventCount: 12,
    });

    expect(summary).toEqual([
      { label: "Kategori", value: "Rate limit per identifier" },
      { label: "Alert", value: "Burst identifier login gagal" },
      { label: "Ambang", value: "10" },
      { label: "Window menit", value: "15" },
      { label: "Jumlah event", value: "12" },
    ]);
  });

  test("serializes audit export csv safely", () => {
    const csv = buildAdminAuditExportCsv([
      {
        id: "audit-1",
        action: "failed_login",
        entityType: "auth",
        actorEmail: "ro***@e***.com",
        ipAddress: "127.0.0.1",
        entityLabel: 'admin-login "portal"',
        createdAt: new Date("2026-03-24T12:30:00.000Z"),
        metadataSummary: [
          { label: "Kategori", value: "Kredensial tidak valid" },
          { label: "Transport", value: "form" },
        ],
      },
    ]);

    expect(csv).toContain("timestamp_iso,action,entity_type,actor_identifier");
    expect(csv).toContain("2026-03-24T12:30:00.000Z");
    expect(csv).toContain('"admin-login ""portal"""');
    expect(csv).toContain("Kategori: Kredensial tidak valid | Transport: form");
  });
});
