import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSlackUsers() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.log("SLACK_BOT_TOKEN not set, skipping Slack user seed");
    return;
  }

  const res = await fetch("https://slack.com/api/users.list", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.ok) {
    console.warn("Slack users.list failed:", data.error);
    return;
  }

  let count = 0;
  for (const member of data.members) {
    if (member.deleted || member.is_bot || !member.profile?.email) continue;

    const slackSub = member.id as string;
    const nickname = (member.profile.display_name || member.profile.real_name || slackSub) as string;

    await prisma.user.upsert({
      where: { slackSub },
      update: { nickname },
      create: {
        sub: `slack:${slackSub}`,
        slackSub,
        nickname,
        avatarUrl: member.profile.image_72 ?? null,
      },
    });
    count++;
  }
  console.log(`Seed complete: ${count} Slack users upserted`);
}

async function main() {
  const instruments = [
    { name: "ボーカル", order: 1 },
    { name: "ギター", order: 2 },
    { name: "ベース", order: 3 },
    { name: "ドラム", order: 4 },
    { name: "キーボード", order: 5 },
    { name: "管楽器", order: 6 },
    { name: "弦楽器", order: 7 },
    { name: "その他", order: 8 },
  ];

  for (const instrument of instruments) {
    await prisma.instrument.upsert({
      where: { name: instrument.name },
      update: { order: instrument.order },
      create: instrument,
    });
  }

  console.log("Seed complete: instruments inserted");

  await seedSlackUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
