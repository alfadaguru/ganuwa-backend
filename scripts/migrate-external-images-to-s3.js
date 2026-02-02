/**
 * Migrate External Images to S3
 *
 * This script:
 * 1. Finds all database records with external (non-S3) image URLs
 * 2. Downloads the images from external sources
 * 3. Uploads them to Contabo S3 storage
 * 4. Updates database records with new S3 URLs and publicIds
 */

// Load environment variables FIRST before importing anything
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const { uploadToS3, deleteFromS3 } = require('../src/utils/s3Upload');

// Import models
const HeroBanner = require('../src/models/HeroBanner');
const News = require('../src/models/News');
const Project = require('../src/models/Project');
const Leader = require('../src/models/Leader');
const MediaGallery = require('../src/models/MediaGallery');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const Page = require('../src/models/Page');
const MDA = require('../src/models/MDA');

// S3 URL patterns
const S3_URL_PATTERNS = [
  /eu2\.contabostorage\.com/,
  /kano-state-website/,
];

function isS3Url(url) {
  if (!url) return false;
  return S3_URL_PATTERNS.some(pattern => pattern.test(url));
}

function isExternalUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

// Download image from URL
async function downloadImage(url) {
  try {
    console.log(`   📥 Downloading: ${url.substring(0, 80)}...`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers['content-type'] || 'image/jpeg',
    };
  } catch (error) {
    console.error(`   ❌ Download failed: ${error.message}`);
    throw error;
  }
}

// Migrate single record
async function migrateRecord(Model, record, imageFieldPath, folder) {
  try {
    // Navigate to the image field
    const pathParts = imageFieldPath.split('.');
    let imageField = record;
    for (const part of pathParts) {
      imageField = imageField?.[part];
    }

    if (!imageField || !imageField.url) {
      return { success: false, reason: 'No image URL' };
    }

    if (isS3Url(imageField.url)) {
      return { success: false, reason: 'Already S3' };
    }

    if (!isExternalUrl(imageField.url)) {
      return { success: false, reason: 'Invalid URL' };
    }

    console.log(`\n   🔄 Processing: ${record.title?.en || record.name?.en || record.email || 'Unknown'}`);
    console.log(`   📝 Current URL: ${imageField.url}`);

    // Download the image
    const { buffer, contentType } = await downloadImage(imageField.url);
    console.log(`   ✅ Downloaded (${(buffer.length / 1024).toFixed(2)} KB)`);

    // Generate filename from record title or ID
    const title = record.title?.en || record.name?.en || record._id.toString();
    const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);

    // Upload to S3
    const s3Result = await uploadToS3(buffer, filename, contentType, folder);
    console.log(`   ✅ Uploaded to S3: ${s3Result.key}`);

    // Update the record
    const updatePath = imageFieldPath + '.url';
    const publicIdPath = imageFieldPath + '.publicId';

    await Model.updateOne(
      { _id: record._id },
      {
        $set: {
          [updatePath]: s3Result.url,
          [publicIdPath]: s3Result.publicId,
        }
      }
    );

    console.log(`   ✅ Database updated`);

    return {
      success: true,
      oldUrl: imageField.url,
      newUrl: s3Result.url,
      publicId: s3Result.publicId,
    };

  } catch (error) {
    console.error(`   ❌ Migration failed: ${error.message}`);
    return {
      success: false,
      reason: error.message,
    };
  }
}

// Migrate all records for a model
async function migrateModel(Model, modelName, imageFieldPath, folder) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Migrating ${modelName}...`);
  console.log('='.repeat(70));

  const results = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  try {
    const records = await Model.find({});
    console.log(`Found ${records.length} ${modelName} records`);

    for (const record of records) {
      results.total++;

      const result = await migrateRecord(Model, record, imageFieldPath, folder);

      if (result.success) {
        results.migrated++;
        results.details.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
          oldUrl: result.oldUrl,
          newUrl: result.newUrl,
          status: 'migrated',
        });
      } else if (result.reason === 'Already S3' || result.reason === 'No image URL') {
        results.skipped++;
      } else {
        results.failed++;
        results.details.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
          status: 'failed',
          reason: result.reason,
        });
      }
    }

    console.log(`\n📊 ${modelName} Summary:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   ✅ Migrated: ${results.migrated}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    return results;

  } catch (error) {
    console.error(`❌ Error migrating ${modelName}:`, error.message);
    return results;
  }
}

// Main migration function
async function migrateExternalImages() {
  console.log('🚀 Starting External Images to S3 Migration\n');
  console.log(`Database: ${process.env.MONGODB_URI?.substring(0, 50)}...\n`);

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allResults = {};

    // Models to migrate (only those with external URLs based on audit)
    const models = [
      { Model: HeroBanner, name: 'HeroBanner', field: 'image', folder: 'hero-banners' },
      { Model: Project, name: 'Project', field: 'featuredImage', folder: 'projects' },
      { Model: Leader, name: 'Leader', field: 'profileImage', folder: 'leaders' },
      // Add others if needed:
      // { Model: News, name: 'News', field: 'featuredImage', folder: 'news' },
      // { Model: Event, name: 'Event', field: 'featuredImage', folder: 'events' },
    ];

    for (const { Model, name, field, folder } of models) {
      allResults[name] = await migrateModel(Model, name, field, folder);

      // Wait a bit between models to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Print overall summary
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('📊 OVERALL MIGRATION SUMMARY');
    console.log('='.repeat(70));

    let totalRecords = 0;
    let totalMigrated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    Object.keys(allResults).forEach(modelName => {
      const results = allResults[modelName];
      totalRecords += results.total;
      totalMigrated += results.migrated;
      totalSkipped += results.skipped;
      totalFailed += results.failed;
    });

    console.log(`\nTotal Records Processed: ${totalRecords}`);
    console.log(`✅ Successfully Migrated: ${totalMigrated}`);
    console.log(`⏭️  Skipped (Already S3/No Image): ${totalSkipped}`);
    console.log(`❌ Failed: ${totalFailed}`);

    if (totalMigrated > 0) {
      console.log(`\n✅ ${totalMigrated} images successfully migrated to S3!`);
    }

    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} images failed to migrate. Check details above.`);
    }

    // Save results to JSON
    const resultsPath = path.join(__dirname, 'migration-to-s3-results.json');
    const fs = require('fs');
    fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
    console.log(`\n📝 Detailed results saved to: ${resultsPath}`);

    console.log('\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  migrateExternalImages()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateExternalImages };