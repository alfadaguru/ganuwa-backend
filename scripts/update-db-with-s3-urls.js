#!/usr/bin/env node

/**
 * Update Database with S3 Image URLs
 * This script updates the database to use S3 URLs instead of external URLs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models
const Leader = require('../src/models/Leader');
const News = require('../src/models/News');
const HeroBanner = require('../src/models/HeroBanner');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kano-state-db';

// Load S3 image mapping
const mappingFile = path.join(__dirname, 's3-image-mapping.json');
const s3Images = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

console.log('🔄 UPDATING DATABASE WITH S3 IMAGE URLS\n');
console.log('=========================================================\n');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function updateLeaders() {
  console.log('👤 Updating Leadership Images...\n');

  try {
    // Update Governor image (gov-abu-1.jpg)
    const governor = await Leader.findOne({ position: 'governor' });
    if (governor) {
      governor.profileImage = {
        url: s3Images['gov-abu-1.jpg'].url,
        publicId: s3Images['gov-abu-1.jpg'].publicId,
        alt: 'Governor Abba Kabir Yusuf'
      };
      await governor.save();
      console.log('✅ Updated Governor image');
    }

    // Update Deputy Governor and SSG images (gov-uniform.jpg)
    const deputyGovernor = await Leader.findOne({ position: 'deputy_governor' });
    if (deputyGovernor) {
      deputyGovernor.profileImage = {
        url: s3Images['gov-uniform.jpg'].url,
        publicId: s3Images['gov-uniform.jpg'].publicId,
        alt: 'Deputy Governor Aminu AbdusSalam'
      };
      await deputyGovernor.save();
      console.log('✅ Updated Deputy Governor image');
    }

    const ssg = await Leader.findOne({ title: { en: 'Secretary to the State Government' } });
    if (ssg) {
      ssg.profileImage = {
        url: s3Images['gov-uniform.jpg'].url,
        publicId: s3Images['gov-uniform.jpg'].publicId,
        alt: 'SSG Umar Farouk Ibrahim'
      };
      await ssg.save();
      console.log('✅ Updated SSG image\n');
    }
  } catch (error) {
    console.error('❌ Error updating leaders:', error.message);
    throw error;
  }
}

async function updateNews() {
  console.log('📰 Updating News Images...\n');

  try {
    // Update ABU news with gov-abu-1.jpg
    const abuNews = await News.findOne({ slug: 'gov-yusuf-attends-abu-45th-convocation-donates-n50-million' });
    if (abuNews) {
      abuNews.featuredImage = {
        url: s3Images['gov-abu-1.jpg'].url,
        publicId: s3Images['gov-abu-1.jpg'].publicId,
        alt: 'Governor at ABU Convocation'
      };
      await abuNews.save();
      console.log('✅ Updated ABU convocation news image');
    }

    // Update appointments news with gov-uniform.jpg
    const appointmentsNews = await News.findOne({ slug: 'governor-approves-new-appointments-in-kano' });
    if (appointmentsNews) {
      appointmentsNews.featuredImage = {
        url: s3Images['gov-uniform.jpg'].url,
        publicId: s3Images['gov-uniform.jpg'].publicId,
        alt: 'Government Officials'
      };
      await appointmentsNews.save();
      console.log('✅ Updated appointments news image');
    }

    // Update motorcycles news with gov-motorcycles.jpg
    const motorcyclesNews = await News.findOne({ slug: 'governor-distributes-600-motorcycles-to-influencers' });
    if (motorcyclesNews) {
      motorcyclesNews.featuredImage = {
        url: s3Images['gov-motorcycles.jpg'].url,
        publicId: s3Images['gov-motorcycles.jpg'].publicId,
        alt: 'Motorcycle Distribution'
      };
      await motorcyclesNews.save();
      console.log('✅ Updated motorcycles distribution news image\n');
    }
  } catch (error) {
    console.error('❌ Error updating news:', error.message);
    throw error;
  }
}

async function updateHeroBanners() {
  console.log('🎨 Updating Hero Banner Images...\n');

  try {
    const banner = await HeroBanner.findOne({});
    if (banner) {
      banner.image = {
        url: s3Images['gov-abu-1.jpg'].url,
        publicId: s3Images['gov-abu-1.jpg'].publicId,
        alt: 'Kano State Government'
      };
      await banner.save();
      console.log('✅ Updated hero banner image\n');
    }
  } catch (error) {
    console.error('❌ Error updating banners:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();

    await updateLeaders();
    await updateNews();
    await updateHeroBanners();

    console.log('=========================================================');
    console.log('✅ UPDATE COMPLETE!\n');
    console.log('All images now use S3 storage URLs.');
    console.log('Visit http://localhost:5173 to see the updated content.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();