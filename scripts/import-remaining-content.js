/**
 * Import All Remaining Website Content
 * Imports: Hero Banners, Quick Links, Announcements, Contacts, Media, FAQs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001/api/v1';
const LOGIN_EMAIL = 'admin@kanostate.gov.ng';
const LOGIN_PASSWORD = 'Admin@2025!ChangeMe';

const DATA_DIR = '/tmp';
const JSON_FILES = {
  heroBanners: path.join(DATA_DIR, 'extracted-hero-banners.json'),
  quickLinks: path.join(DATA_DIR, 'extracted-quick-links.json'),
  announcements: path.join(DATA_DIR, 'extracted-announcements.json'),
  contacts: path.join(DATA_DIR, 'extracted-emergency-contacts.json'),
  mediaGallery: path.join(DATA_DIR, 'extracted-media-gallery.json'),
  faqs: path.join(DATA_DIR, 'extracted-faqs.json'),
};

const ENDPOINTS = {
  login: '/auth/login',
  heroBanners: '/hero-banners',
  quickLinks: '/quick-links',
  announcements: '/announcements',
  contacts: '/contacts',
  mediaGallery: '/media',
  faqs: '/faqs',
};

let authToken = null;
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: [],
};

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}${ENDPOINTS.login}`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });

    authToken = response.data.data.accessToken;
    console.log('✅ Login successful\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

function readJSONFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

async function importItem(endpoint, item, itemName) {
  try {
    const response = await axios.post(
      `${API_URL}${endpoint}`,
      item,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    stats.success++;
    return { success: true };
  } catch (error) {
    stats.failed++;
    const errorMsg = error.response?.data?.error?.message || error.message;
    stats.errors.push({ item: itemName, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

async function importCollection(collectionName, endpoint, jsonFile) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📦 Importing ${collectionName}...`);
  console.log('='.repeat(70));

  const items = readJSONFile(jsonFile);

  if (!items) {
    console.log(`⚠️  File not found: ${jsonFile}`);
    return;
  }

  if (items.length === 0) {
    console.log(`⚠️  No items to import`);
    return;
  }

  console.log(`📊 Found ${items.length} items to import\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemName = item.title?.en || item.name?.en || item.question?.en || `Item ${i + 1}`;

    process.stdout.write(`   [${i + 1}/${items.length}] ${itemName}... `);

    stats.total++;
    const result = await importItem(endpoint, item, itemName);

    if (result.success) {
      console.log('✅');
    } else {
      console.log(`❌ (${result.error})`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ ${collectionName} import completed`);
}

async function importAllContent() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║            IMPORT REMAINING WEBSITE CONTENT                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Import each collection
  await importCollection('Hero Banners', ENDPOINTS.heroBanners, JSON_FILES.heroBanners);
  await importCollection('Quick Links', ENDPOINTS.quickLinks, JSON_FILES.quickLinks);
  await importCollection('Announcements', ENDPOINTS.announcements, JSON_FILES.announcements);
  await importCollection('Emergency Contacts', ENDPOINTS.contacts, JSON_FILES.contacts);
  await importCollection('Media Gallery', ENDPOINTS.mediaGallery, JSON_FILES.mediaGallery);
  await importCollection('FAQs', ENDPOINTS.faqs, JSON_FILES.faqs);

  // Print summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                      IMPORT SUMMARY                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total Items Processed: ${stats.total}`);
  console.log(`✅ Successfully Imported: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);

  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(2) : 0;
  console.log(`📈 Success Rate: ${successRate}%\n`);

  if (stats.errors.length > 0) {
    console.log('❌ Errors:');
    stats.errors.slice(0, 10).forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.item}: ${err.error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
    console.log('');
  }

  if (stats.failed === 0) {
    console.log('🎉 All remaining content imported successfully!\n');
  } else {
    console.log(`⚠️  ${stats.failed} items failed to import. Check errors above.\n`);
  }

  console.log('═'.repeat(70));

  // Show total database count
  console.log('\n📊 EXPECTED TOTAL IN DATABASE:');
  console.log('   - News: 9');
  console.log('   - Press Releases: 3');
  console.log('   - Leaders: 2');
  console.log('   - MDAs: 20');
  console.log('   - LGAs: 44');
  console.log('   - Services: 20');
  console.log('   - Projects: 8');
  console.log('   - Hero Banners: 3');
  console.log('   - Quick Links: 13');
  console.log('   - Announcements: 4');
  console.log('   - Emergency Contacts: 10');
  console.log('   - Media Gallery: 8');
  console.log('   - FAQs: 8');
  console.log('   ───────────────────');
  console.log(`   TOTAL: 152 items\n`);
}

importAllContent().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
