const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TEMPLATES_DIR = path.join(__dirname, '..', 'src', 'renderer', 'public', 'OutputSocialAds');

async function compressTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`Directory not found: ${TEMPLATES_DIR}`);
    return;
  }

  const files = fs.readdirSync(TEMPLATES_DIR);
  const templateFiles = files.filter(f => f.startsWith('t') && f.endsWith('.png'));

  console.log(`Found ${templateFiles.length} template images to compress.`);

  let totalBeforeSize = 0;
  let totalAfterSize = 0;
  let processedCount = 0;

  for (const file of templateFiles) {
    const inputPath = path.join(TEMPLATES_DIR, file);
    const parsedPath = path.parse(file);
    const outputPath = path.join(TEMPLATES_DIR, `${parsedPath.name}.thumb.webp`);

    const statBefore = fs.statSync(inputPath);
    totalBeforeSize += statBefore.size;

    try {
      await sharp(inputPath)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      const statAfter = fs.statSync(outputPath);
      totalAfterSize += statAfter.size;
      processedCount++;
      
      process.stdout.write('.');
    } catch (err) {
      console.error(`\nError processing ${file}: ${err.message}`);
    }
  }

  console.log('\n\n--- Compression Report ---');
  console.log(`Processed: ${processedCount} images`);
  console.log(`Before size: ${(totalBeforeSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`After size: ${(totalAfterSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Savings: ${((1 - (totalAfterSize / totalBeforeSize)) * 100).toFixed(1)}% space saved`);
}

compressTemplates().catch(console.error);
