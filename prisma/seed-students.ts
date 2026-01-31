import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding students...");

  // Read students.json
  const studentsFile = path.join(process.cwd(), "src", "data", "students.json");
  const studentsData = JSON.parse(fs.readFileSync(studentsFile, "utf-8"));

  // Delete existing students
  await prisma.student.deleteMany();
  console.log("🗑️  Deleted existing students");

  // Insert students
  for (const student of studentsData.students) {
    await prisma.student.create({
      data: {
        name: student.name,
        grade: student.grade,
        score: student.score,
        image: student.image,
        manualOrder: null, // Initially use auto-sort by score
        isVisible: true,
      },
    });
  }

  console.log(`✅ Created ${studentsData.students.length} students`);

  // Display students sorted by score
  const students = await prisma.student.findMany({
    orderBy: { score: "desc" },
  });

  console.log("\n📊 Students sorted by score:");
  students.forEach((student, index) => {
    console.log(
      `${index + 1}. ${student.name} - ${student.grade} - ${student.score}`,
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding students:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
