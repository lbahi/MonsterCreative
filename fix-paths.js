const fs = require('fs')

function replaceInFile(filePath, search, replacement) {
  let content = fs.readFileSync(filePath, 'utf8')
  content = content.split(search).join(replacement)
  fs.writeFileSync(filePath, content)
  console.log(`Updated ${filePath}`)
}

replaceInFile(
  'src/renderer/src/screens/image-gen/modes/SocialAdsForm/data/social-templates.ts',
  '"/SocialAdsTemplates/',
  '"./SocialAdsTemplates/'
)
replaceInFile(
  'src/renderer/src/screens/image-gen/modes/SocialAdsForm/components/TemplatePreviewLightbox.tsx',
  '`/OutputSocialAds/',
  '`./OutputSocialAds/'
)
replaceInFile(
  'src/renderer/src/screens/image-gen/modes/SocialAdsForm/components/TemplateGrid.tsx',
  '`/OutputSocialAds/',
  '`./OutputSocialAds/'
)
replaceInFile('src/renderer/src/screens/image-gen/constants.ts', "'/VtonVibes/", "'./VtonVibes/")
replaceInFile(
  'src/renderer/src/screens/image-gen/modes/VtonForm/data/model-templates.ts',
  "'/VtonModels/",
  "'./VtonModels/"
)
