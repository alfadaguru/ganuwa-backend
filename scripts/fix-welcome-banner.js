/**
 * Fix Welcome to Kano State Hero Banner
 * Removes the 404 Unsplash URL so it can be replaced via admin panel
 */

// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const HeroBanner = require('../src/models/HeroBanner');

async function fixWelcomeBanner() {
  console.log('🔧 Fixing "Welcome to Kano State" hero banner...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the Welcome to Kano State banner
    const banner = await HeroBanner.findOne({
      'title.en': 'Welcome to Kano State'
    });

    if (!banner) {
      console.log('❌ "Welcome to Kano State" banner not found');
      return;
    }

    console.log('Found banner:');
    console.log(`  ID: ${banner._id}`);
    console.log(`  Title: ${banner.title.en}`);
    console.log(`  Current URL: ${banner.image?.url || 'None'}\n`);

    // Update to remove the 404 URL
    await HeroBanner.updateOne(
      { _id: banner._id },
      {
        $set: {
          'image.url': null,
          'image.publicId': null,
          'image.alt': null
        }
      }
    );

    console.log('✅ Banner updated successfully!');
    console.log('   Image URL set to null - ready for new upload via admin panel\n');

    console.log('📝 Next Steps:');
    console.log('   1. Open admin panel: http://localhost:5174');
    console.log('   2. Navigate to Content > Hero Banners');
    console.log('   3. Click Edit on "Welcome to Kano State"');
    console.log('   4. Upload a new image');
    console.log('   5. Click Update Banner\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

fixWelcomeBanner()
  .then(() => {
    console.log('✅ Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
