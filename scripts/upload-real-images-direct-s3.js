#!/usr/bin/env node

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const CDN_URL = process.env.S3_CDN_URL || process.env.S3_ENDPOINT;

// Real images from kanostate.gov.ng
const imagesToDownload = [
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/1-Kano_State_Governor.jpg',
    filename: 'governor-abba-kabir-yusuf.jpg',
    description: 'Governor Engr. Abba Kabir Yusuf',
    category: 'leaders',
    s3Key: 'leaders/governor-abba-kabir-yusuf.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Comrade-3.jpg',
    filename: 'deputy-governor-aminu-abdussalam.jpg',
    description: 'Deputy Governor Comrade Aminu AbdusSalam Gwarzo',
    category: 'leaders',
    s3Key: 'leaders/deputy-governor-aminu-abdussalam.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/SSG.jpg',
    filename: 'ssg-umar-farouk-ibrahim.jpg',
    description: 'Secretary to State Government - Umar Farouk Ibrahim',
    category: 'commissioners',
    s3Key: 'commissioners/ssg-umar-farouk-ibrahim.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2024/08/Head-o-Service.jpg',
    filename: 'head-of-service-abdullahi-musa.jpg',
    description: 'Head of Service - Alhaji Abdullahi Musa',
    category: 'commissioners',
    s3Key: 'commissioners/head-of-service-abdullahi-musa.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Mohammed-Tajo-Othman.jpg',
    filename: 'commissioner-mohammed-tajo-othman.jpg',
    description: 'Commissioner - Mohammed Tajo Othman',
    category: 'commissioners',
    s3Key: 'commissioners/mohammed-tajo-othman.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2026/02/Abba.jpg',
    filename: 'news-governor-abu-convocation.jpg',
    description: 'Governor at ABU Convocation',
    category: 'news',
    s3Key: 'news/governor-abu-convocation.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Uniform.jpg',
    filename: 'news-new-appointments.jpg',
    description: 'New Government Appointments Announcement',
    category: 'news',
    s3Key: 'news/new-appointments.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Recrui.jpg',
    filename: 'news-governor-rejoins-apc.jpg',
    description: 'Governor Rejoining APC',
    category: 'news',
    s3Key: 'news/governor-rejoins-apc.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/03/Sarki.jpg',
    filename: 'event-sallah-festival.jpg',
    description: 'Sallah Festival Celebration',
    category: 'events',
    s3Key: 'events/sallah-festival.jpg'
  },
  {
    url: 'http://kanostate.gov.ng/wp-content/uploads/2025/10/indee.jpg',
    filename: 'event-65th-anniversary.jpg',
    description: 'Kano State 65th Anniversary',
    category: 'events',
    s3Key: 'events/65th-anniversary.jpg'
  }
];

async function downloadImage(url) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000
    });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error(`   ❌ Failed to download:`, error.message);
    throw error;
  }
}

async function uploadToS3(imageBuffer, s3Key, contentType = 'image/jpeg') {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: imageBuffer,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    // Construct the public URL
    const publicUrl = `${CDN_URL}/${s3Key}`;
    return publicUrl;
  } catch (error) {
    console.error(`   ❌ Failed to upload to S3:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Real Kano State Images Upload (Direct S3)\n');
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
      console.log(`   URL: ${image.url}`);

      // Download image
      console.log(`   📥 Downloading...`);
      const imageBuffer = await downloadImage(image.url);
      console.log(`   ✅ Downloaded (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

      // Upload to S3
      console.log(`   ☁️  Uploading to S3: ${image.s3Key}`);
      const publicUrl = await uploadToS3(imageBuffer, image.s3Key);
      console.log(`   ✅ Uploaded! URL: ${publicUrl}`);

      // Store result
      uploadedImages[image.category].push({
        description: image.description,
        filename: image.filename,
        originalUrl: image.url,
        s3Key: image.s3Key,
        s3Url: publicUrl
      });

      successCount++;
    } catch (error) {
      console.error(`\n❌ Error processing ${image.description}`);
      failCount++;
    }
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
