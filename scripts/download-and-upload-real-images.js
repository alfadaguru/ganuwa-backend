#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token';

// Real images from kanostate.gov.ng
const imagesToDownload = [
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/1-Kano_State_Governor.jpg',
    filename: 'governor-abba-kabir-yusuf.jpg',
    description: 'Governor Engr. Abba Kabir Yusuf',
    category: 'leaders'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Comrade-3.jpg',
    filename: 'deputy-governor-aminu-abdussalam.jpg',
    description: 'Deputy Governor Comrade Aminu AbdusSalam Gwarzo',
    category: 'leaders'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/SSG.jpg',
    filename: 'ssg-umar-farouk-ibrahim.jpg',
    description: 'Secretary to State Government - Umar Farouk Ibrahim',
    category: 'commissioners'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2024/08/Head-o-Service.jpg',
    filename: 'head-of-service-abdullahi-musa.jpg',
    description: 'Head of Service - Alhaji Abdullahi Musa',
    category: 'commissioners'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Mohammed-Tajo-Othman.jpg',
    filename: 'commissioner-mohammed-tajo-othman.jpg',
    description: 'Commissioner - Mohammed Tajo Othman',
    category: 'commissioners'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2026/02/Abba.jpg',
    filename: 'news-governor-abu-convocation.jpg',
    description: 'Governor at ABU Convocation',
    category: 'news'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Uniform.jpg',
    filename: 'news-new-appointments.jpg',
    description: 'New Government Appointments Announcement',
    category: 'news'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Recrui.jpg',
    filename: 'news-governor-rejoins-apc.jpg',
    description: 'Governor Rejoining APC',
    category: 'news'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/03/Sarki.jpg',
    filename: 'event-sallah-festival.jpg',
    description: 'Sallah Festival Celebration',
    category: 'events'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/10/indee.jpg',
    filename: 'event-65th-anniversary.jpg',
    description: 'Kano State 65th Anniversary',
    category: 'events'
  }
];

const TEMP_DIR = path.join(__dirname, '../temp-images');

// Create temp directory
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function downloadImage(url, filepath) {
  try {
    console.log(`📥 Downloading: ${url}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`   ✅ Downloaded to: ${path.basename(filepath)}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`   ❌ Failed to download ${url}:`, error.message);
    throw error;
  }
}

async function uploadToS3(filepath, description) {
  try {
    console.log(`☁️  Uploading to S3: ${path.basename(filepath)}`);

    const form = new FormData();
    form.append('file', fs.createReadStream(filepath));

    const response = await axios.post(`${API_BASE_URL}/upload/single`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000
    });

    if (response.data.success) {
      console.log(`   ✅ Uploaded! URL: ${response.data.data.url}`);
      return response.data.data;
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error(`   ❌ Failed to upload ${filepath}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Real Kano State Images Download & Upload\n');
  console.log('=' .repeat(60));

  const uploadedImages = {
    leaders: [],
    commissioners: [],
    news: [],
    events: []
  };

  let successCount = 0;
  let failCount = 0;

  for (const image of imagesToDownload) {
    try {
      console.log(`\n📸 Processing: ${image.description}`);

      const tempFilepath = path.join(TEMP_DIR, image.filename);

      // Download image
      await downloadImage(image.url, tempFilepath);

      // Upload to S3
      const uploadResult = await uploadToS3(tempFilepath, image.description);

      // Store result
      uploadedImages[image.category].push({
        description: image.description,
        filename: image.filename,
        originalUrl: image.url,
        s3Url: uploadResult.url,
        s3Key: uploadResult.key
      });

      // Delete temp file
      fs.unlinkSync(tempFilepath);

      successCount++;
    } catch (error) {
      console.error(`\n❌ Error processing ${image.description}`);
      failCount++;
    }
  }

  // Clean up temp directory
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  }

  // Save mapping to JSON file
  const outputFile = path.join(__dirname, 'uploaded-real-images.json');
  fs.writeFileSync(outputFile, JSON.stringify(uploadedImages, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ IMAGE UPLOAD COMPLETE!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   • Successfully uploaded: ${successCount}`);
  console.log(`   • Failed: ${failCount}`);
  console.log(`   • Leaders: ${uploadedImages.leaders.length}`);
  console.log(`   • Commissioners: ${uploadedImages.commissioners.length}`);
  console.log(`   • News: ${uploadedImages.news.length}`);
  console.log(`   • Events: ${uploadedImages.events.length}`);
  console.log(`\n📁 Image mapping saved to: ${outputFile}`);
  console.log('\n✅ Next Step: Run update-database-with-real-images.js to update database records\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
