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
      { name: 'news', expected: 9 },
      { name: 'pressreleases', expected: 3 },
      { name: 'leaders', expected: 2 },
      { name: 'mdas', expected: 20 },
      { name: 'lgas', expected: 44 },
      { name: 'services', expected: 20 },
      { name: 'projects', expected: 8 },
      { name: 'herobanners', expected: 3 },
      { name: 'quicklinks', expected: 13 },
      { name: 'announcements', expected: 4 },
      { name: 'mediagalleries', expected: 8 },
      { name: 'faqs', expected: 8 },
    ];

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                COMPLETE DATABASE CONTENT SUMMARY                   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    let total = 0;
    let expectedTotal = 0;
    let allMatch = true;

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      total += count;
      expectedTotal += col.expected;

      const match = count === col.expected;
      if (!match) allMatch = false;

      const status = match ? '✅' : (count > 0 ? '⚠️ ' : '❌');
      const diff = count - col.expected;
      const diffStr = diff > 0 ? `(+${diff})` : diff < 0 ? `(${diff})` : '';

      console.log(
        `${status} ${col.name.padEnd(20)} ${String(count).padStart(3)}/${String(col.expected).padStart(3)} ${diffStr}`
      );
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 TOTAL: ${total}/${expectedTotal}`);
    console.log(`📈 COMPLETION: ${((total / expectedTotal) * 100).toFixed(2)}%`);
    console.log('='.repeat(70));

    if (allMatch && total === expectedTotal) {
      console.log('\n🎉 100% COMPLETE! ALL WEBSITE CONTENT IS IN DATABASE!\n');
    } else if (total === expectedTotal) {
      console.log('\n✅ All items imported, but some distributions differ from expected.\n');
    } else {
      const missing = expectedTotal - total;
      console.log(`\n⚠️  ${missing} items still need to be imported.\n`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

countAllData();
