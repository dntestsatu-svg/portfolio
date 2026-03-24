import "dotenv/config";
import { disconnectDb } from "../lib/db";
import { pruneExpiredAuditLogs } from "../lib/services/audit-log";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await pruneExpiredAuditLogs({ dryRun });

  console.log(
    JSON.stringify(
      {
        retentionDays: result.retentionDays,
        cutoff: result.cutoff.toISOString(),
        expiredCount: result.expiredCount,
        deletedCount: result.deletedCount,
        dryRun: result.dryRun,
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await disconnectDb();
  })
  .catch(async (error) => {
    console.error(error);
    await disconnectDb();
    process.exit(1);
  });
