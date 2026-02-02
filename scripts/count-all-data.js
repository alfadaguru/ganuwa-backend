const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const countAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    const collections = [
      'news',
      'pressreleases',
      'leaders',
      'mdas',
      'lgas',
      'services',
      'projects',
    ];

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    DATABASE CONTENT SUMMARY                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    let total = 0;

    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      total += count;
      const checkmark = count > 0 ? '✅' : '❌';
      console.log(`${checkmark} ${collectionName.padEnd(20)} ${count} documents`);
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 TOTAL DOCUMENTS: ${total}/106`);
    console.log(`📈 SUCCESS RATE: ${((total / 106) * 100).toFixed(2)}%`);
    console.log('='.repeat(70));

    if (total === 106) {
      console.log('\n🎉 100% DATA IMPORT SUCCESS! ALL 106 ITEMS IN DATABASE!\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countAllData();
