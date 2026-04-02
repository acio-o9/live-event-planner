import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
