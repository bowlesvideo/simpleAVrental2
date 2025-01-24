import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

async function convertWebPToJpg() {
  const publicDir = path.join(process.cwd(), 'public')
  const imagesDir = path.join(publicDir, 'images')
  const jpgOutputDir = path.join(imagesDir, 'jpg-versions')

  // Create output directory if it doesn't exist
  await fs.mkdir(jpgOutputDir, { recursive: true })

  try {
    const files = await fs.readdir(imagesDir)
    const webpFiles = files.filter(file => file.toLowerCase().endsWith('.webp'))

    console.log(`Found ${webpFiles.length} WebP files to convert`)

    for (const webpFile of webpFiles) {
      const inputPath = path.join(imagesDir, webpFile)
      const outputFileName = webpFile.replace(/\.webp$/i, '.jpg')
      const outputPath = path.join(jpgOutputDir, outputFileName)

      console.log(`Converting ${webpFile} to JPG...`)

      await sharp(inputPath)
        .jpeg({
          quality: 90,
          mozjpeg: true
        })
        .toFile(outputPath)

      console.log(`Successfully converted ${webpFile} to ${outputFileName}`)
    }

    console.log('All conversions complete!')
  } catch (error) {
    console.error('Error during conversion:', error)
  }
}

convertWebPToJpg() 