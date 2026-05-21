const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'src', 'renderer', 'public')

const targetDirs = [
  { path: path.join(publicDir, 'OutputSocialAds'), filter: (f) => f.match(/^t\d+\.png$/) },
  { path: path.join(publicDir, 'VtonModels'), filter: (f) => f.endsWith('.png') },
  { path: path.join(publicDir, 'VtonVibes'), filter: (f) => f.endsWith('.png') }
]

async function compressTemplates() {
  let beforeTotal = 0
  let afterTotal = 0
  let processedCount = 0

  for (const dirConfig of targetDirs) {
    if (!fs.existsSync(dirConfig.path)) continue

    const files = fs.readdirSync(dirConfig.path)
    const templateFiles = files.filter(dirConfig.filter)

    console.log(
      `\n🚀 Found ${templateFiles.length} templates in ${path.basename(dirConfig.path)}...`
    )

    for (const file of templateFiles) {
      // Skip if it's already a thumbnail or doesn't need thumbnailing
      if (file.includes('.thumb.')) continue

      const inputPath = path.join(dirConfig.path, file)
      const outputName = file.replace('.png', '.thumb.webp')
      const outputPath = path.join(dirConfig.path, outputName)

      // Skip if thumb already exists and is newer than source? No, just overwrite to be safe.
      const stats = fs.statSync(inputPath)
      beforeTotal += stats.size

      try {
        await sharp(inputPath)
          .resize(400) // Width 400px, auto height
          .webp({ quality: 80 })
          .toFile(outputPath)

        const outStats = fs.statSync(outputPath)
        afterTotal += outStats.size
        processedCount++

        console.log(
          `✅ Compressed ${file} -> ${outputName} (${(outStats.size / 1024).toFixed(1)} KB)`
        )
      } catch (err) {
        console.error(`❌ Error processing ${file}:`, err)
      }
    }
  }

  console.log('\n--- COMPRESSION REPORT ---')
  console.log(`Total Files Processed: ${processedCount}`)
  console.log(`Before (Total PNG): ${(beforeTotal / (1024 * 1024)).toFixed(2)} MB`)
  console.log(`After (Total WebP Thumbnails): ${(afterTotal / (1024 * 1024)).toFixed(2)} MB`)

  if (beforeTotal > 0) {
    console.log(`Reduction: ${(((beforeTotal - afterTotal) / beforeTotal) * 100).toFixed(1)}%`)
  }
}

compressTemplates()
