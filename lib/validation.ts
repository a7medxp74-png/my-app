import { z } from "zod";

export const startSessionSchema = z.object({ durationMinutes: z.number().int().min(1).max(180) });
export const verifySessionSchema = z.object({ proofUrl: z.string().url().max(2048) });
export const ownerSettingsSchema = z.object({
  pointsPerMinute: z.number().min(0).max(100),
  xpPerMinute: z.number().min(0).max(100),
  minSessionMinutes: z.number().int().min(1).max(180),
  maxSessionMinutes: z.number().int().min(1).max(360),
  completionBonusPoints: z.number().int().min(0).max(10000),
  completionBonusXp: z.number().int().min(0).max(10000),
  levelBaseXp: z.number().int().min(1).max(100000),
  levelGrowth: z.number().min(1).max(3)
});
