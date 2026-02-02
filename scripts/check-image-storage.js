/**
 * Database Image Storage Audit Script
 *
 * This script checks all database records to identify images that are NOT stored in S3.
 * It reports on:
 * 1. Records with missing image fields
 * 2. Records with external URLs (not S3)
 * 3. Records with missing publicId (required for S3 management)
 * 4. Summary statistics by model
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

// Check individual model
async function checkModel(Model, modelName, imageFieldPath) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Checking ${modelName}...`);
  console.log('='.repeat(70));

  const issues = {
    missingImage: [],
    externalUrl: [],
    missingPublicId: [],
    validS3: [],
  };

  try {
    const records = await Model.find({});
    console.log(`Total ${modelName} records: ${records.length}`);

    for (const record of records) {
      // Navigate to the image field
      const imageField = imageFieldPath.split('.').reduce((obj, key) => obj?.[key], record);

      if (!imageField || !imageField.url) {
        issues.missingImage.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
        });
      } else if (!isS3Url(imageField.url) && isExternalUrl(imageField.url)) {
        issues.externalUrl.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
          url: imageField.url,
        });
      } else if (!imageField.publicId) {
        issues.missingPublicId.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
          url: imageField.url,
        });
      } else if (isS3Url(imageField.url)) {
        issues.validS3.push({
          id: record._id,
          title: record.title?.en || record.name?.en || record.email || 'Unknown',
        });
      }
    }

    // Print results
    console.log(`\n📊 ${modelName} Summary:`);
    console.log(`  ✅ Valid S3 images: ${issues.validS3.length}`);
    console.log(`  ⚠️  Missing images: ${issues.missingImage.length}`);
    console.log(`  ❌ External URLs: ${issues.externalUrl.length}`);
    console.log(`  ⚠️  Missing publicId: ${issues.missingPublicId.length}`);

    if (issues.externalUrl.length > 0) {
      console.log(`\n❌ External URLs found in ${modelName}:`);
      issues.externalUrl.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title}`);
        console.log(`     ID: ${item.id}`);
        console.log(`     URL: ${item.url}`);
      });
    }

    if (issues.missingPublicId.length > 0) {
      console.log(`\n⚠️  Missing publicId in ${modelName}:`);
      issues.missingPublicId.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (ID: ${item.id})`);
        console.log(`     URL: ${item.url}`);
      });
    }

    if (issues.missingImage.length > 0) {
      console.log(`\n⚠️  Missing images in ${modelName}:`);
      issues.missingImage.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (ID: ${item.id})`);
      });
    }

    return issues;

  } catch (error) {
    console.error(`❌ Error checking ${modelName}:`, error.message);
    return issues;
  }
}

// Main audit function
async function auditImageStorage() {
  console.log('🔍 Starting Database Image Storage Audit\n');
  console.log(`Database: ${process.env.MONGODB_URI || 'Not specified'}\n`);

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const allIssues = {};

    // Check each model
    const models = [
      { Model: HeroBanner, name: 'HeroBanner', field: 'image' },
      { Model: News, name: 'News', field: 'featuredImage' },
      { Model: Project, name: 'Project', field: 'featuredImage' },
      { Model: Leader, name: 'Leader', field: 'profileImage' },
      { Model: MediaGallery, name: 'MediaGallery', field: 'media.0' }, // First media item
      { Model: User, name: 'User', field: 'profileImage' },
      { Model: Event, name: 'Event', field: 'featuredImage' },
      { Model: Page, name: 'Page', field: 'featuredImage' },
      { Model: MDA, name: 'MDA', field: 'logo' },
    ];

    for (const { Model, name, field } of models) {
      allIssues[name] = await checkModel(Model, name, field);
    }

    // Print overall summary
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('📊 OVERALL SUMMARY');
    console.log('='.repeat(70));

    let totalRecords = 0;
    let totalValidS3 = 0;
    let totalMissingImages = 0;
    let totalExternalUrls = 0;
    let totalMissingPublicId = 0;

    Object.keys(allIssues).forEach(modelName => {
      const issues = allIssues[modelName];
      const total = issues.validS3.length + issues.missingImage.length +
                    issues.externalUrl.length + issues.missingPublicId.length;

      totalRecords += total;
      totalValidS3 += issues.validS3.length;
      totalMissingImages += issues.missingImage.length;
      totalExternalUrls += issues.externalUrl.length;
      totalMissingPublicId += issues.missingPublicId.length;
    });

    console.log(`\nTotal Records Checked: ${totalRecords}`);
    console.log(`✅ Valid S3 Images: ${totalValidS3} (${((totalValidS3/totalRecords)*100).toFixed(1)}%)`);
    console.log(`⚠️  Missing Images: ${totalMissingImages} (${((totalMissingImages/totalRecords)*100).toFixed(1)}%)`);
    console.log(`❌ External URLs: ${totalExternalUrls} (${((totalExternalUrls/totalRecords)*100).toFixed(1)}%)`);
    console.log(`⚠️  Missing publicId: ${totalMissingPublicId} (${((totalMissingPublicId/totalRecords)*100).toFixed(1)}%)`);

    // Save results to JSON
    const resultsPath = path.join(__dirname, 'image-storage-audit.json');
    const fs = require('fs');
    fs.writeFileSync(resultsPath, JSON.stringify(allIssues, null, 2));
    console.log(`\n📝 Detailed results saved to: ${resultsPath}`);

    // Recommendations
    console.log(`\n\n${'='.repeat(70)}`);
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(70));

    if (totalExternalUrls > 0) {
      console.log(`\n❌ ${totalExternalUrls} records have EXTERNAL URLs (not S3)`);
      console.log('   Action Required: These images need to be downloaded and uploaded to S3');
      console.log('   Run: node scripts/migrate-external-images-to-s3.js');
    }

    if (totalMissingPublicId > 0) {
      console.log(`\n⚠️  ${totalMissingPublicId} records are missing publicId field`);
      console.log('   Action Required: These records need publicId populated for S3 management');
      console.log('   These may be S3 images uploaded before publicId field was added');
    }

    if (totalMissingImages > 0) {
      console.log(`\n⚠️  ${totalMissingImages} records have NO images`);
      console.log('   This is OK if images are optional for that content type');
      console.log('   Otherwise, upload images through the admin panel');
    }

    if (totalExternalUrls === 0 && totalMissingPublicId === 0) {
      console.log(`\n✅ EXCELLENT! All images are properly stored in S3 with publicId tracking`);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run audit
if (require.main === module) {
  auditImageStorage()
    .then(() => {
      console.log('✅ Audit completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { auditImageStorage };
