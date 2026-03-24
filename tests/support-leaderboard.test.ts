import { describe, expect, test } from "bun:test";
import {
  compareSupportLeaderboardEntries,
  getPublicSupporterDisplayName,
  hashSupporterIdentity,
} from "../lib/services/support";

describe("support leaderboard helpers", () => {
  test("hashes supporter identity deterministically", () => {
    expect(hashSupporterIdentity("  Rodex Supporter  ")).toBe(
      hashSupporterIdentity("rodex   supporter"),
    );
    expect(hashSupporterIdentity("")).toBeNull();
  });

  test("masks anonymous supporters at display layer", () => {
    expect(
      getPublicSupporterDisplayName({
        supporterName: "Rodex Supporter",
        isAnonymous: true,
      }),
    ).toBe("Anonim");

    expect(
      getPublicSupporterDisplayName({
        supporterName: "Rodex Supporter",
        isAnonymous: false,
      }),
    ).toBe("Rodex Supporter");
  });

  test("sorts leaderboard entries by total, then count, then latest support", () => {
    const items = [
      {
        totalAmount: 200_000,
        supportCount: 2,
        lastSupportAtISO: "2026-03-24T08:00:00.000Z",
      },
      {
        totalAmount: 200_000,
        supportCount: 4,
        lastSupportAtISO: "2026-03-20T08:00:00.000Z",
      },
      {
        totalAmount: 200_000,
        supportCount: 4,
        lastSupportAtISO: "2026-03-25T08:00:00.000Z",
      },
      {
        totalAmount: 500_000,
        supportCount: 1,
        lastSupportAtISO: "2026-03-10T08:00:00.000Z",
      },
    ];

    const sorted = [...items].sort(compareSupportLeaderboardEntries);

    expect(sorted).toEqual([
      items[3],
      items[2],
      items[1],
      items[0],
    ]);
  });
});
