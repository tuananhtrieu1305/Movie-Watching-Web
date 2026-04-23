const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

async function fixGenres() {
  const initSqlPath = path.join(__dirname, '../../database/init.sql');
  const sql = fs.readFileSync(initSqlPath, 'utf8');

  // Tìm kiếm đoạn INSERT INTO \`genres\` VALUES (...)
  const insertPattern = /INSERT INTO `genres` VALUES \((.+?)\);/;
  const match = sql.match(insertPattern);
  if (!match) {
    console.log("Không tìm thấy dòng INSERT INTO `genres`");
    return;
  }

  const valuesStr = match[1];
  // Regex to match: 1,'Hành động','hanh-dong','Phim hành động kịch tính','2026-01-22 00:29:16'
  const tuples = valuesStr.split(/\),\(/).map(s => s.replace(/^\(/, '').replace(/\)$/, ''));

  for (const tuple of tuples) {
    // Basic CSV-like split for simple patterns where no comma in text
    // E.g., 1,'Hành động','hanh-dong',...
    const parts = tuple.split(',');
    const id = parseInt(parts[0]);
    const name = parts[1].replace(/^'|'$/g, '');
    const slug = parts[2].replace(/^'|'$/g, '');
    
    console.log(`Updating genre ${id} to ${name}`);
    await prisma.genres.update({
      where: { id: id },
      data: { name: name }
    });
  }

  console.log("Cập nhật thành công!");
}

fixGenres().catch(console.error).finally(() => prisma.$disconnect());
