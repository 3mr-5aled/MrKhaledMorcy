import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("KhaledEng2020*", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mrkhaledmorcy.com" },
    update: {},
    create: {
      email: "admin@mrkhaledmorcy.com",
      name: "مستر خالد مرسي",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create sample grades
  const grades = await Promise.all([
    prisma.grade.upsert({
      where: { id: "prep-1" },
      update: {},
      create: {
        id: "prep-1",
        name: "أولى إعدادي",
        slug: "prep-1",
        stage: "المرحلة الإعدادية",
        color: "#1B9AAA",
        order: 1,
      },
    }),
    prisma.grade.upsert({
      where: { id: "prep-2" },
      update: {},
      create: {
        id: "prep-2",
        name: "ثانية إعدادي",
        slug: "prep-2",
        stage: "المرحلة الإعدادية",
        color: "#06D6A0",
        order: 2,
      },
    }),
    prisma.grade.upsert({
      where: { id: "prep-3" },
      update: {},
      create: {
        id: "prep-3",
        name: "ثالثة إعدادي",
        slug: "prep-3",
        stage: "المرحلة الإعدادية",
        color: "#EF476F",
        order: 3,
      },
    }),
    prisma.grade.upsert({
      where: { id: "sec-1" },
      update: {},
      create: {
        id: "sec-1",
        name: "أولى ثانوي",
        slug: "sec-1",
        stage: "المرحلة الثانوية",
        color: "#FFC43D",
        order: 4,
      },
    }),
    prisma.grade.upsert({
      where: { id: "sec-2" },
      update: {},
      create: {
        id: "sec-2",
        name: "ثانية ثانوي",
        slug: "sec-2",
        stage: "المرحلة الثانوية",
        color: "#118AB2",
        order: 5,
      },
    }),
    prisma.grade.upsert({
      where: { id: "sec-3" },
      update: {},
      create: {
        id: "sec-3",
        name: "ثالثة ثانوي",
        slug: "sec-3",
        stage: "المرحلة الثانوية",
        color: "#073B4C",
        order: 6,
      },
    }),
    prisma.grade.upsert({
      where: { id: "univ" },
      update: {},
      create: {
        id: "univ",
        name: "جامعي",
        slug: "university",
        stage: "المرحلة الجامعية",
        color: "#8B5CF6",
        order: 7,
      },
    }),
  ]);

  console.log(`✅ Created ${grades.length} grades`);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Admin credentials:");
  console.log("   Email: admin@mrkhaledmorcy.com");
  console.log("   Password: KhaledEng2020*");
  console.log("\n⚠️  Please change the password after first login!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
