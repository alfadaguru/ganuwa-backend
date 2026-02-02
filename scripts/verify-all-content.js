/**
 * Comprehensive Content Verification
 * Compares website source data vs database data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const WEBSITE_DIR = '/Users/aliyumohammedlawal/Documents/Projects - New/kanostate.gov.ng/source code/kano-state-website/src/pages';

async function extractWebsiteContent() {
  console.log('📖 Reading website source files...\n');

  // Read NewsPage.tsx
  const newsPageContent = fs.readFileSync(path.join(WEBSITE_DIR, 'NewsPage.tsx'), 'utf8');
  const newsArticlesMatch = newsPageContent.match(/const newsArticles = \[([\s\S]*?)\];/);
  const newsCount = newsArticlesMatch ? (newsArticlesMatch[1].match(/\{/g) || []).length : 0;

  const pressReleasesMatch = newsPageContent.match(/const pressReleases = \[([\s\S]*?)\];/);
  const pressReleasesCount = pressReleasesMatch ? (pressReleasesMatch[1].match(/\{/g) || []).length : 0;

  // Read MDAsPage.tsx
  const mdasPageContent = fs.readFileSync(path.join(WEBSITE_DIR, 'MDAsPage.tsx'), 'utf8');
  const ministriesMatch = mdasPageContent.match(/const ministries = \[([\s\S]*?)\];/);
  const ministriesCount = ministriesMatch ? (ministriesMatch[1].match(/\{/g) || []).length : 0;

  const agenciesMatch = mdasPageContent.match(/const agencies = \[([\s\S]*?)\];/);
  const agenciesCount = agenciesMatch ? (agenciesMatch[1].match(/\{/g) || []).length : 0;

  // Read LGAsPage.tsx
  const lgasPageContent = fs.readFileSync(path.join(WEBSITE_DIR, 'LGAsPage.tsx'), 'utf8');
  const lgasMatch = lgasPageContent.match(/const lgas = \[([\s\S]*?)\];/);
  const lgasCount = lgasMatch ? (lgasMatch[1].match(/\{/g) || []).length : 0;

  // Read ServicesPage.tsx or component
  const servicesFiles = [
    path.join(WEBSITE_DIR, 'ServicesPage.tsx'),
    path.join(WEBSITE_DIR, '../components/sections/ServicesLibrary.tsx')
  ];

  let servicesCount = 0;
  for (const file of servicesFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const servicesMatch = content.match(/const services = \[([\s\S]*?)\];/);
      if (servicesMatch) {
        servicesCount = (servicesMatch[1].match(/\{/g) || []).length;
        break;
      }
    }
  }

  // Read ProjectsPage.tsx
  const projectsPageContent = fs.readFileSync(path.join(WEBSITE_DIR, 'ProjectsPage.tsx'), 'utf8');
  const projectsMatch = projectsPageContent.match(/const projects = \[([\s\S]*?)\];/);
  const projectsCount = projectsMatch ? (projectsMatch[1].match(/\{/g) || []).length : 0;

  // Read LeadershipSection or ExecutivePage
  const leadershipFiles = [
    path.join(WEBSITE_DIR, '../components/sections/LeadershipSection.tsx'),
    path.join(WEBSITE_DIR, 'ExecutivePage.tsx')
  ];

  let leadersCount = 0;
  for (const file of leadershipFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const leadersMatch = content.match(/const (leaders|executives) = \[([\s\S]*?)\];/);
      if (leadersMatch) {
        leadersCount = (leadersMatch[2].match(/\{/g) || []).length;
        break;
      }
    }
  }

  return {
    news: newsCount,
    pressReleases: pressReleasesCount,
    mdas: ministriesCount + agenciesCount,
    ministries: ministriesCount,
    agencies: agenciesCount,
    lgas: lgasCount,
    services: servicesCount,
    projects: projectsCount,
    leaders: leadersCount,
  };
}

async function getDatabaseContent() {
  console.log('🗄️  Querying database...\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const counts = {
    news: await db.collection('news').countDocuments(),
    pressReleases: await db.collection('pressreleases').countDocuments(),
    leaders: await db.collection('leaders').countDocuments(),
    mdas: await db.collection('mdas').countDocuments(),
    lgas: await db.collection('lgas').countDocuments(),
    services: await db.collection('services').countDocuments(),
    projects: await db.collection('projects').countDocuments(),
  };

  // Get MDA breakdown
  const ministries = await db.collection('mdas').countDocuments({ type: 'ministry' });
  const agencies = await db.collection('mdas').countDocuments({ type: 'agency' });

  counts.ministries = ministries;
  counts.agencies = agencies;

  await mongoose.disconnect();

  return counts;
}

async function verifyContent() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║              CONTENT VERIFICATION: WEBSITE vs DATABASE            ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    const websiteContent = await extractWebsiteContent();
    const databaseContent = await getDatabaseContent();

    console.log('┌────────────────────┬──────────┬──────────┬─────────────┐');
    console.log('│ Content Type       │ Website  │ Database │ Status      │');
    console.log('├────────────────────┼──────────┼──────────┼─────────────┤');

    const categories = [
      { name: 'News Articles', key: 'news' },
      { name: 'Press Releases', key: 'pressReleases' },
      { name: 'Leaders', key: 'leaders' },
      { name: 'MDAs (Total)', key: 'mdas' },
      { name: '  - Ministries', key: 'ministries' },
      { name: '  - Agencies', key: 'agencies' },
      { name: 'LGAs', key: 'lgas' },
      { name: 'Services', key: 'services' },
      { name: 'Projects', key: 'projects' },
    ];

    let allMatch = true;
    let totalWebsite = 0;
    let totalDatabase = 0;

    categories.forEach(cat => {
      const websiteCount = websiteContent[cat.key] || 0;
      const databaseCount = databaseContent[cat.key] || 0;
      const matches = websiteCount === databaseCount;
      const status = matches ? '✅ Match' : '❌ Mismatch';

      if (!matches && !cat.name.startsWith('  -')) {
        allMatch = false;
      }

      if (!cat.name.startsWith('  -')) {
        totalWebsite += websiteCount;
        totalDatabase += databaseCount;
      }

      console.log(
        `│ ${cat.name.padEnd(18)} │ ${String(websiteCount).padStart(8)} │ ${String(databaseCount).padStart(8)} │ ${status.padEnd(11)} │`
      );
    });

    console.log('├────────────────────┼──────────┼──────────┼─────────────┤');
    console.log(
      `│ ${'TOTAL'.padEnd(18)} │ ${String(totalWebsite).padStart(8)} │ ${String(totalDatabase).padStart(8)} │ ${(allMatch ? '✅ Match' : '❌ Mismatch').padEnd(11)} │`
    );
    console.log('└────────────────────┴──────────┴──────────┴─────────────┘\n');

    if (allMatch) {
      console.log('🎉 VERIFICATION SUCCESSFUL!\n');
      console.log('✅ All website content is in the database');
      console.log('✅ Counts match perfectly');
      console.log('✅ No content is missing\n');
    } else {
      console.log('⚠️  VERIFICATION ISSUES FOUND!\n');
      console.log('Some counts do not match. Details:\n');

      categories.forEach(cat => {
        const websiteCount = websiteContent[cat.key] || 0;
        const databaseCount = databaseContent[cat.key] || 0;

        if (websiteCount !== databaseCount && !cat.name.startsWith('  -')) {
          const diff = databaseCount - websiteCount;
          if (diff > 0) {
            console.log(`${cat.name}: ${diff} extra items in database`);
          } else {
            console.log(`${cat.name}: ${Math.abs(diff)} items missing from database`);
          }
        }
      });
      console.log('');
    }

    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifyContent();
