#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api/v1';
const ADMIN_TOKEN = fs.readFileSync('/tmp/kano-admin-token.txt', 'utf8').trim();
const ASSETS_DIR = path.join(__dirname, '../temp-kano-assets');

console.log('📤 UPLOADING NEW KANO STATE LOGO TO S3\n');

const files = [
  { name: 'kano-logo-new.png', desc: 'Kano State Logo (Transparent Background)' },
  { name: 'kano-logo-new-white-bg.png', desc: 'Kano State Logo (White Background)' }
];

async function uploadFile(filename, description) {
  const filePath = path.join(ASSETS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return null;
  }

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
      console.log(`   URL: ${response.data.data.url}`);
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
  const outputPath = path.join(__dirname, 'new-logo-s3.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2)
  );

  console.log('✅ New Kano State logos uploaded to S3!');
  console.log(`\n📁 Mapping saved to: new-logo-s3.json`);
  console.log(`\n💡 You can now use these logos in your website:\n`);

  Object.entries(results).forEach(([filename, data]) => {
    console.log(`${filename}:`);
    console.log(`  ${data.url}\n`);
  });
}

main().catch(console.error);