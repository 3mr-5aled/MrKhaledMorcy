import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding students...");

  // Note: This seed file is deprecated and kept for reference only
  // The current Student model requires gradeId, studentGrade, testGrade, and position
  // Students should be created through the admin interface at /admin/students

  console.log("⚠️  This seed file is deprecated.");
  console.log("📝 Use the admin interface to create students: /admin/students");
  console.log("✅ No seeding performed.");

  return;
}

main()
  .catch((e) => {
    console.error("❌ Error seeding students:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
