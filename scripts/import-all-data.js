/**
 * Import All Extracted Data to Backend via API
 *
 * This script imports all extracted data from JSON files into the backend
 * by making authenticated API requests.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001/api/v1';
const LOGIN_EMAIL = 'admin@kanostate.gov.ng';
const LOGIN_PASSWORD = 'Admin@2025!ChangeMe';

// JSON file paths
const DATA_DIR = '/tmp';
const JSON_FILES = {
  news: path.join(DATA_DIR, 'extracted-news.json'),
  pressReleases: path.join(DATA_DIR, 'extracted-press-releases.json'),
  mdas: path.join(DATA_DIR, 'extracted-mdas.json'),
  lgas: path.join(DATA_DIR, 'extracted-lgas.json'),
  services: path.join(DATA_DIR, 'extracted-services.json'),
  leaders: path.join(DATA_DIR, 'extracted-leaders.json'),
  projects: path.join(DATA_DIR, 'extracted-projects.json'),
};

// API endpoints
const ENDPOINTS = {
  login: '/auth/login',
  news: '/news',
  pressReleases: '/press-releases',
  mdas: '/mdas',
  lgas: '/lgas',
  services: '/services',
  leaders: '/leaders',
  projects: '/projects',
};

let authToken = null;
let stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

/**
 * Login and get authentication token
 */
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

/**
 * Read JSON file
 */
function readJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Import a single item
 */
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
    return { success: true, data: response.data };
  } catch (error) {
    stats.failed++;
    const errorMsg = error.response?.data?.error?.message || error.message;
    stats.errors.push({ item: itemName, error: errorMsg });
    return { success: false, error: errorMsg };
  }
}

/**
 * Import all items of a specific type
 */
async function importCollection(collectionName, endpoint, jsonFile) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📦 Importing ${collectionName}...`);
  console.log('='.repeat(70));

  if (!fs.existsSync(jsonFile)) {
    console.log(`⚠️  File not found: ${jsonFile}`);
    return;
  }

  const items = readJSONFile(jsonFile);
  if (!items || items.length === 0) {
    console.log(`⚠️  No items to import`);
    return;
  }

  console.log(`📊 Found ${items.length} items to import\n`);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemName = item.name?.en || item.title?.en || `Item ${i + 1}`;

    process.stdout.write(`   [${i + 1}/${items.length}] ${itemName}... `);

    stats.total++;
    const result = await importItem(endpoint, item, itemName);

    if (result.success) {
      console.log('✅');
    } else {
      console.log(`❌ (${result.error})`);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ ${collectionName} import completed`);
}

/**
 * Main import function
 */
async function importAllData() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    DATA IMPORT SCRIPT                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Step 2: Import each collection in order
  await importCollection('News Articles', ENDPOINTS.news, JSON_FILES.news);
  await importCollection('Press Releases', ENDPOINTS.pressReleases, JSON_FILES.pressReleases);
  await importCollection('Leaders', ENDPOINTS.leaders, JSON_FILES.leaders);
  await importCollection('MDAs', ENDPOINTS.mdas, JSON_FILES.mdas);
  await importCollection('LGAs', ENDPOINTS.lgas, JSON_FILES.lgas);
  await importCollection('Services', ENDPOINTS.services, JSON_FILES.services);
  await importCollection('Projects', ENDPOINTS.projects, JSON_FILES.projects);

  // Step 3: Print final summary
  printSummary();
}

/**
 * Print final summary
 */
function printSummary() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                      IMPORT SUMMARY                                ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Total Items Processed: ${stats.total}`);
  console.log(`✅ Successfully Imported: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);

  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(2) : 0;
  console.log(`📈 Success Rate: ${successRate}%\n`);

  if (stats.errors.length > 0) {
    console.log('❌ Errors:');
    stats.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.item}: ${err.error}`);
    });
    console.log('');
  }

  if (stats.failed === 0) {
    console.log('🎉 All data imported successfully!\n');
  } else {
    console.log(`⚠️  ${stats.failed} items failed to import. Check errors above.\n`);
  }

  console.log('═'.repeat(70));
}

// Run the import
importAllData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});