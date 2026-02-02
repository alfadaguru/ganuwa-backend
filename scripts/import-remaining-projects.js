/**
 * Import Remaining Projects (Handle Rate Limiting)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5001/api/v1';
const LOGIN_EMAIL = 'admin@kanostate.gov.ng';
const LOGIN_PASSWORD = 'Admin@2025!ChangeMe';

let authToken = null;

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, {
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

async function importProject(project, index, total) {
  try {
    console.log(`[${index + 1}/${total}] Importing: ${project.name.en}...`);

    const response = await axios.post(
      `${API_URL}/projects`,
      project,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Success\n`);
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.log(`❌ Failed: ${errorMsg}\n`);
    return { success: false, error: errorMsg };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║          IMPORT REMAINING PROJECTS (WITH RATE LIMIT HANDLING)      ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Login
  const loggedIn = await login();
  if (!loggedIn) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Read projects
  const projectsFile = path.join('/tmp', 'extracted-projects.json');
  const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));

  console.log(`📊 Found ${projects.length} projects total\n`);
  console.log('🔄 Importing with 2-second delay between requests...\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < projects.length; i++) {
    const result = await importProject(projects[i], i, projects.length);

    if (result.success) {
      success++;
    } else {
      failed++;
    }

    // Wait 2 seconds between requests to avoid rate limiting
    if (i < projects.length - 1) {
      console.log('⏳ Waiting 2 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Successfully Imported: ${success}/8`);
  console.log(`❌ Failed: ${failed}/8`);
  console.log(`📈 Success Rate: ${((success / 8) * 100).toFixed(2)}%`);
  console.log('='.repeat(70));

  if (success === 8) {
    console.log('\n🎉 ALL PROJECTS IMPORTED SUCCESSFULLY!\n');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
