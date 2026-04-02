const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Processes an array of uploaded files: 
 * 1. Converts them to WebP format.
 * 2. Resizes to max width of 1200px.
 * 3. Deletes the original uploaded file.
 * 4. Returns an array of relative paths for the WebP images.
 * 
 * FIX: Throws an error if ALL images fail processing (instead of silently returning empty).
 */
exports.processPropertyImages = async (files) => {
  if (!files || files.length === 0) return [];

  const processedImages = [];
  const failedCount = [];

  for (const file of files) {
    try {
      const fileName = `${path.parse(file.filename).name}.webp`;
      const outputPath = path.join(file.destination, fileName);

      await sharp(file.path)
        .resize(1200, null, { // Max width 1200px, maintain aspect ratio
          withoutEnlargement: true 
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      processedImages.push(`/uploads/${fileName}`);
      
      // Delete original only if successfully processed
      try { fs.unlinkSync(file.path); } catch (e) {}
    } catch (err) {
      console.error(`Failed to process image ${file.filename}:`, err);
      failedCount.push(file.filename);
      // Still delete original to avoid cluttering if it's corrupt
      try { fs.unlinkSync(file.path); } catch (e) {}
    }
  }

  // FIX: If ALL images failed, throw an error so the controller knows
  if (processedImages.length === 0 && failedCount.length > 0) {
    throw new Error(`All ${failedCount.length} uploaded image(s) failed processing. Files: ${failedCount.join(', ')}`);
  }

  // Log partial failures for awareness
  if (failedCount.length > 0) {
    console.warn(`[Image Processor] ${failedCount.length}/${files.length} images failed. Successfully processed: ${processedImages.length}`);
  }

  return processedImages;
};
