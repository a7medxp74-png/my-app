import { db } from "@/lib/db";

export type CommitSettings = {
  pointsPerMinute: number;
  xpPerMinute: number;
  minSessionMinutes: number;
  maxSessionMinutes: number;
  completionBonusPoints: number;
  completionBonusXp: number;
  levelBaseXp: number;
  levelGrowth: number;
};

const fallback: CommitSettings = {
  pointsPerMinute: 2,
  xpPerMinute: 3,
  minSessionMinutes: 5,
  maxSessionMinutes: 180,
  completionBonusPoints: 10,
  completionBonusXp: 25,
  levelBaseXp: 100,
  levelGrowth: 1.35
};

export async function getSettings(): Promise<CommitSettings> {
  const rows = await db.appSetting.findMany();
  const out = { ...fallback };
  for (const row of rows) {
    if (row.key in out && typeof row.value === "number") (out as Record<string, number>)[row.key] = row.value;
  }
  return out;
}

export function calculateLevel(xp: number, settings: CommitSettings) {
  let level = 1;
  let totalForCurrent = 0;
  let nextCost = settings.levelBaseXp;
  while (xp >= totalForCurrent + nextCost && level < 1000) {
    totalForCurrent += nextCost;
    level += 1;
    nextCost = Math.round(settings.levelBaseXp * Math.pow(settings.levelGrowth, level - 1));
  }
  return { level, currentXp: xp - totalForCurrent, nextLevelXp: nextCost, totalForNext: totalForCurrent + nextCost, progress: Math.min(100, ((xp - totalForCurrent) / nextCost) * 100) };
}

export function rewards(minutes: number, settings: CommitSettings) {
  return {
    points: Math.max(0, Math.floor(minutes * settings.pointsPerMinute + settings.completionBonusPoints)),
    xp: Math.max(0, Math.floor(minutes * settings.xpPerMinute + settings.completionBonusXp))
  };
}
