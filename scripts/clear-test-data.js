/**
 * Script to clear all test data from the database
 * This will delete all documents from all collections EXCEPT the admin user
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections\n`);

    let totalDeleted = 0;

    // Clear each collection
    for (const collection of collections) {
      const collectionName = collection.name;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`⏭️  Skipping system collection: ${collectionName}`);
        continue;
      }

      // For users collection, keep only admin users
      if (collectionName === 'users') {
        const result = await db.collection(collectionName).deleteMany({
          role: { $ne: 'super_admin' } // Delete all non-super_admin users
        });
        console.log(`🗑️  ${collectionName}: Deleted ${result.deletedCount} test users (kept super_admin)`);
        totalDeleted += result.deletedCount;
        continue;
      }

      // Delete all documents from other collections
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`🗑️  ${collectionName}: Deleted ${result.deletedCount} documents`);
      totalDeleted += result.deletedCount;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Database cleanup complete!`);
    console.log(`📊 Total documents deleted: ${totalDeleted}`);
    console.log('='.repeat(60));

    // Show remaining data
    console.log('\n📋 Remaining data:');
    for (const collection of collections) {
      const collectionName = collection.name;
      if (collectionName.startsWith('system.')) continue;

      const count = await db.collection(collectionName).countDocuments();
      if (count > 0) {
        console.log(`   ${collectionName}: ${count} documents`);
      }
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Confirmation prompt
console.log('⚠️  WARNING: This will delete all test data from the database!');
console.log('⚠️  Admin users (super_admin role) will be preserved.\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  clearDatabase();
} else {
  console.log('❌ Action cancelled. To proceed, run:');
  console.log('   node scripts/clear-test-data.js --confirm\n');
  process.exit(0);
}