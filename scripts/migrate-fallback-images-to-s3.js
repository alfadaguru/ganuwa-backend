const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

// S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'eu-central-1',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
});

// All Unsplash URLs found in the public website
const fallbackImages = [
  // Hero Section fallbacks
  {
    name: 'hero-government-building',
    url: 'https://images.unsplash.com/photo-1541872703-74c9e44e43b4?q=80&w=2940',
    folder: 'defaults/hero-banners',
    description: 'Government building'
  },
  {
    name: 'hero-city-skyline',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940',
    folder: 'defaults/hero-banners',
    description: 'City skyline'
  },
  {
    name: 'hero-traditional-market',
    url: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?q=80&w=2940',
    folder: 'defaults/hero-banners',
    description: 'Traditional market'
  },

  // News Section fallbacks
  {
    name: 'news-default',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2940',
    folder: 'defaults/news',
    description: 'News default image'
  },

  // Leadership fallbacks
  {
    name: 'leader-default',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2787',
    folder: 'defaults/leaders',
    description: 'Leader default image'
  },

  // News Page specific
  {
    name: 'news-page-default',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&q=80&fit=crop',
    folder: 'defaults/news',
    description: 'News page default'
  },
  {
    name: 'media-gallery-1',
    url: 'https://images.unsplash.com/photo-1577563682339-f950fdec57ff?w=300&h=200&fit=crop',
    folder: 'defaults/media',
    description: 'Media gallery item 1'
  },
  {
    name: 'media-gallery-2',
    url: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=300&h=200&fit=crop',
    folder: 'defaults/media',
    description: 'Media gallery item 2'
  },
  {
    name: 'media-gallery-3',
    url: 'https://images.unsplash.com/photo-1599223773440-62e5aa42e43d?w=300&h=200&fit=crop',
    folder: 'defaults/media',
    description: 'Media gallery item 3'
  },
  {
    name: 'media-gallery-4',
    url: 'https://images.unsplash.com/photo-1558403194-611308249627?w=300&h=200&fit=crop',
    folder: 'defaults/media',
    description: 'Media gallery item 4'
  },
];

// Function to download image from URL
async function downloadImage(url) {
  try {
    console.log(`📥 Downloading: ${url}`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'image/jpeg',
    };
  } catch (error) {
    console.error(`❌ Failed to download ${url}:`, error.message);
    throw error;
  }
}

// Function to upload to S3
async function uploadToS3(buffer, filename, folder, contentType) {
  try {
    const ext = contentType.split('/')[1] || 'jpg';
    const key = `${folder}/${filename}.${ext}`;

    console.log(`📤 Uploading to S3: ${key}`);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the S3 URL (will need presigned URL generation)
    const s3Url = `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET}/${key}`;

    return {
      key,
      url: s3Url,
      contentType,
    };
  } catch (error) {
    console.error(`❌ Failed to upload to S3:`, error.message);
    throw error;
  }
}

// Main migration function
async function migrateFallbackImages() {
  console.log('🚀 Starting Fallback Image Migration to S3\n');
  console.log(`Total images to migrate: ${fallbackImages.length}\n`);

  const results = {
    success: [],
    failed: [],
  };

  for (const image of fallbackImages) {
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Processing: ${image.name}`);
      console.log(`Description: ${image.description}`);

      // Download from Unsplash
      const { buffer, contentType } = await downloadImage(image.url);
      console.log(`✅ Downloaded (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

      // Upload to S3
      const s3Result = await uploadToS3(buffer, image.name, image.folder, contentType);
      console.log(`✅ Uploaded to S3: ${s3Result.key}`);

      results.success.push({
        name: image.name,
        originalUrl: image.url,
        s3Key: s3Result.key,
        s3Url: s3Result.url,
        folder: image.folder,
      });

      console.log(`✅ SUCCESS: ${image.name}`);

    } catch (error) {
      console.error(`❌ FAILED: ${image.name} - ${error.message}`);
      results.failed.push({
        name: image.name,
        url: image.url,
        error: error.message,
      });
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MIGRATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`✅ Successful: ${results.success.length}/${fallbackImages.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${fallbackImages.length}\n`);

  if (results.success.length > 0) {
    console.log('✅ SUCCESSFULLY MIGRATED IMAGES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    results.success.forEach(img => {
      console.log(`Name: ${img.name}`);
      console.log(`Folder: ${img.folder}`);
      console.log(`S3 Key: ${img.s3Key}`);
      console.log(`Original: ${img.originalUrl}`);
      console.log(`S3 URL: ${img.s3Url}`);
      console.log('');
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED IMAGES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    results.failed.forEach(img => {
      console.log(`Name: ${img.name}`);
      console.log(`URL: ${img.url}`);
      console.log(`Error: ${img.error}`);
      console.log('');
    });
  }

  // Save results to JSON file
  const resultsPath = path.join(__dirname, 'migration-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 Results saved to: ${resultsPath}\n`);

  return results;
}

// Run migration
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  migrateFallbackImages()
    .then(() => {
      console.log('✅ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateFallbackImages };
