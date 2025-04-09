const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parse/sync");

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the CSV file
    const filePath = path.join(
      __dirname,
      "../app/data/resources/career-development-page/roadmaps/roadmap.csv"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Parse CSV content
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    // Clear existing records (optional)
    await prisma.roadmap.deleteMany();

    // Insert records
    for (const record of records) {
      await prisma.roadmap.create({
        data: {
          id: parseInt(record.id),
          title: record.title,
          type: record.type,
          description: record.description,
          category: record.category,
          link: record.link,
          downloadLink: record.download_link.trim(), // Remove any extra whitespace
        },
      });
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
