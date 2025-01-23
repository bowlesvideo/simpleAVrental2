const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function compressImages(inputDir, outputDir, options = {}) {
  const {
    quality = 80, // JPEG quality (0-100)
    width = null, // null means maintain aspect ratio
    format = 'jpeg', // output format
    recursive = true // process subdirectories
  } = options;

  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Read all files in the input directory
  const files = await fs.readdir(inputDir);

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const stat = await fs.stat(inputPath);

    if (stat.isDirectory() && recursive) {
      // Recursively process subdirectories
      const newOutputDir = path.join(outputDir, file);
      await compressImages(inputPath, newOutputDir, options);
      continue;
    }

    // Check if file is an image
    const ext = path.extname(file).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    if (!validExtensions.includes(ext)) {
      continue;
    }

    const outputPath = path.join(outputDir, `${path.parse(file).name}.${format}`);

    try {
      // Process the image
      const pipeline = sharp(inputPath);

      // Resize if width is specified
      if (width) {
        pipeline.resize(width, null, { withoutEnlargement: true });
      }

      // Set format and quality
      if (format === 'jpeg') {
        pipeline.jpeg({ quality });
      } else if (format === 'webp') {
        pipeline.webp({ quality });
      } else if (format === 'png') {
        pipeline.png({ quality });
      }

      await pipeline.toFile(outputPath);
      console.log(`Compressed: ${file} -> ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

// Example usage
const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!inputDir || !outputDir) {
  console.log('Usage: node compress-images.js <input-directory> <output-directory>');
  console.log('Optional environment variables:');
  console.log('  QUALITY=80           JPEG quality (0-100)');
  console.log('  WIDTH=1920          Target width in pixels');
  console.log('  FORMAT=jpeg         Output format (jpeg, webp, png)');
  console.log('  RECURSIVE=true      Process subdirectories');
  process.exit(1);
}

// Get options from environment variables
const options = {
  quality: parseInt(process.env.QUALITY) || 80,
  width: parseInt(process.env.WIDTH) || null,
  format: process.env.FORMAT || 'jpeg',
  recursive: process.env.RECURSIVE !== 'false'
};

compressImages(inputDir, outputDir, options)
  .then(() => console.log('Compression complete!'))
  .catch(error => console.error('Error:', error)); 