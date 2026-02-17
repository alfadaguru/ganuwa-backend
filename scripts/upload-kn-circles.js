#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api/v1';
const ADMIN_TOKEN = fs.readFileSync('/tmp/kano-admin-token.txt', 'utf8').trim();
const ASSETS_DIR = path.join(__dirname, '../temp-kano-assets');

console.log('📤 UPLOADING KN CIRCLE IMAGES TO S3\n');

const files = [
  { name: 'kn-circle.png', desc: 'KN Circle (Full Resolution)' },
  { name: 'kn-circle-512.png', desc: 'KN Circle (512x512)' }
];

async function uploadFile(filename, description) {
  const filePath = path.join(ASSETS_DIR, filename);

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${API_BASE_URL}/upload/single`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (response.data.success) {
      console.log(`✅ ${description}`);
      console.log(`   URL: ${response.data.data.url.substring(0, 80)}...`);
      console.log(`   Public ID: ${response.data.data.publicId}\n`);
      return response.data.data;
    }
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.response?.data || error.message);
  }
}

async function main() {
  const results = {};

  for (const file of files) {
    const result = await uploadFile(file.name, file.desc);
    if (result) {
      results[file.name] = result;
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'kn-circles-s3.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('✅ KN circles uploaded to S3!');
  console.log(`\n📁 Mapping saved to: kn-circles-s3.json\n`);
}

main().catch(console.error);
