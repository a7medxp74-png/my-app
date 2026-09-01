import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaults = {
    pointsPerMinute: 2,
    xpPerMinute: 3,
    minSessionMinutes: 5,
    maxSessionMinutes: 180,
    completionBonusPoints: 10,
    completionBonusXp: 25,
    levelBaseXp: 100,
    levelGrowth: 1.35
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  const owners = (process.env.OWNER_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (owners.length) {
    await prisma.user.updateMany({ where: { email: { in: owners } }, data: { role: "OWNER" } });
  }
}

main().finally(() => prisma.$disconnect());
