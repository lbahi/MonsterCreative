const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'src', 'renderer', 'public', 'OutputSocialAds');

async function compressTemplates() {
  const files = fs.readdirSync(templatesDir);
  const templateFiles = files.filter(f => f.match(/^t\d+\.png$/));
  
  let beforeTotal = 0;
  let afterTotal = 0;
  let processedCount = 0;

  console.log(`🚀 Found ${templateFiles.length} templates to process...`);

  for (const file of templateFiles) {
    const inputPath = path.join(templatesDir, file);
    const outputName = file.replace('.png', '.thumb.webp');
    const outputPath = path.join(templatesDir, outputName);

    const stats = fs.statSync(inputPath);
    beforeTotal += stats.size;

    try {
      await sharp(inputPath)
        .resize(400) // Width 400px, auto height
        .webp({ quality: 80 })
        .toFile(outputPath);

      const outStats = fs.statSync(outputPath);
      afterTotal += outStats.size;
      processedCount++;

      console.log(`✅ Compressed ${file} -> ${outputName} (${(outStats.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }

  console.log('\n--- COMPRESSION REPORT ---');
  console.log(`Total Files Processed: ${processedCount}`);
  console.log(`Before (Total PNG): ${(beforeTotal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`After (Total WebP Thumbnails): ${(afterTotal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Reduction: ${(((beforeTotal - afterTotal) / beforeTotal) * 100).toFixed(1)}%`);
}

compressTemplates();
