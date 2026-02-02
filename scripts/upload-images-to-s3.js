#!/usr/bin/env node

/**
 * Upload Kano State Images to S3
 * This script uploads all downloaded images to S3 using the API
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api/v1';
const ADMIN_TOKEN = fs.readFileSync('/tmp/kano-admin-token.txt', 'utf8').trim();
const ASSETS_DIR = path.join(__dirname, '../temp-kano-assets');

console.log('📤 UPLOADING KANO STATE IMAGES TO S3\n');
console.log('=========================================================\n');

// Image mappings
const imagesToUpload = [
  { file: 'gov-abu-1.jpg', description: 'Governor at ABU Convocation' },
  { file: 'gov-motorcycles.jpg', description: 'Motorcycle Distribution Event' },
  { file: 'gov-uniform.jpg', description: 'Government Officials' },
  { file: 'kano-logo.png', description: 'Kano State Logo' }
];

async function uploadImage(filename, description) {
  try {
    const filePath = path.join(ASSETS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      return null;
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      `${API_BASE_URL}/upload/single`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    if (response.data.success) {
      console.log(`✅ Uploaded: ${filename}`);
      console.log(`   URL: ${response.data.data.url}`);
      console.log(`   Public ID: ${response.data.data.publicId}\n`);
      return response.data.data;
    } else {
      console.error(`❌ Failed to upload ${filename}:`, response.data);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error uploading ${filename}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  const uploadedImages = {};

  for (const { file, description } of imagesToUpload) {
    console.log(`📸 Uploading ${file} (${description})...`);
    const result = await uploadImage(file, description);
    if (result) {
      uploadedImages[file] = result;
    }
  }

  // Save mapping to file for use in update script
  const mappingFile = path.join(__dirname, 's3-image-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(uploadedImages, null, 2));

  console.log('=========================================================');
  console.log('✅ UPLOAD COMPLETE!\n');
  console.log(`Uploaded ${Object.keys(uploadedImages).length}/${imagesToUpload.length} images successfully.`);
  console.log(`\nImage mapping saved to: ${mappingFile}\n`);

  return uploadedImages;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  });