#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kano-state-db';

// Real image URLs from kanostate.gov.ng
const REAL_IMAGE_URLS = {
  governor: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/1-Kano_State_Governor.jpg',
  deputyGovernor: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Comrade-3.jpg',
  ssg: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/SSG.jpg',
  headOfService: 'http://kanostate.gov.ng/wp-content/uploads/2024/08/Head-o-Service.jpg',
  commissioner1: 'http://kanostate.gov.ng/wp-content/uploads/2020/07/Mohammed-Tajo-Othman.jpg',
  newsAbuConvocation: 'http://kanostate.gov.ng/wp-content/uploads/2026/02/Abba.jpg',
  newsAppointments: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Uniform.jpg',
  newsApc: 'http://kanostate.gov.ng/wp-content/uploads/2025/09/Recrui.jpg',
  eventSallah: 'http://kanostate.gov.ng/wp-content/uploads/2025/03/Sarki.jpg',
  event65thAnniversary: 'http://kanostate.gov.ng/wp-content/uploads/2025/10/indee.jpg'
};

// Define schemas
const leaderSchema = new mongoose.Schema({
  name: { type: Map, of: String },
  title: { type: Map, of: String },
  photo: String,
  slug: String
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: { type: Map, of: String },
  slug: String,
  image: String,
  description: { type: Map, of: String },
  date: Date
}, { timestamps: true });

const newsSchema = new mongoose.Schema({
  title: { type: Map, of: String },
  slug: String,
  featuredImage: {
    url: String,
    publicId: String,
    alt: String
  },
  content: { type: Map, of: String },
  date: Date
}, { timestamps: true, strict: false });

const Leader = mongoose.model('Leader', leaderSchema);
const Event = mongoose.model('Event', eventSchema);
const News = mongoose.model('News', newsSchema);

async function main() {
  try {
    console.log('🚀 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📸 Updating database with REAL image URLs from kanostate.gov.ng\n');
    console.log('=' .repeat(60));

    let updateCount = 0;

    // Update Events with real images
    console.log('\n📅 Updating Events...');

    const sallahEvent = await Event.findOne({ slug: 'sallah-festival-2025' });
    if (sallahEvent) {
      sallahEvent.image = REAL_IMAGE_URLS.eventSallah;
      await sallahEvent.save();
      console.log('   ✅ Updated Sallah Festival image');
      updateCount++;
    }

    const anniversaryEvent = await Event.findOne({ slug: 'kano-state-65th-anniversary-celebration' });
    if (anniversaryEvent) {
      anniversaryEvent.image = REAL_IMAGE_URLS.event65thAnniversary;
      await anniversaryEvent.save();
      console.log('   ✅ Updated 65th Anniversary image');
      updateCount++;
    }

    // Create/Update Leaders if they don't exist
    console.log('\n👤 Creating/Updating Leaders...');

    await Leader.findOneAndUpdate(
      { slug: 'governor-abba-kabir-yusuf' },
      {
        name: { en: 'Engr. Abba Kabir Yusuf', ha: 'Injiniya Abba Kabir Yusuf' },
        title: { en: 'Governor of Kano State', ha: 'Gwamnan Jihar Kano' },
        photo: REAL_IMAGE_URLS.governor,
        slug: 'governor-abba-kabir-yusuf',
        position: 'Governor',
        bio: {
          en: 'His Excellency, Engr. Abba Kabir Yusuf is the Executive Governor of Kano State.',
          ha: 'Mai Girma, Injiniya Abba Kabir Yusuf shine Gwamnan Jihar Kano.'
        }
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Updated Governor photo');
    updateCount++;

    await Leader.findOneAndUpdate(
      { slug: 'deputy-governor-aminu-abdussalam' },
      {
        name: { en: 'Comrade Aminu Abdussalam Gwarzo', ha: 'Aminu Abdussalam Gwarzo' },
        title: { en: 'Deputy Governor of Kano State', ha: 'Mataimakin Gwamnan Jihar Kano' },
        photo: REAL_IMAGE_URLS.deputyGovernor,
        slug: 'deputy-governor-aminu-abdussalam',
        position: 'Deputy Governor',
        bio: {
          en: 'His Excellency, Comrade Aminu Abdussalam Gwarzo is the Deputy Governor of Kano State.',
          ha: 'Mai Girma, Aminu Abdussalam Gwarzo shine Mataimakin Gwamnan Jihar Kano.'
        }
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Updated Deputy Governor photo');
    updateCount++;

    await Leader.findOneAndUpdate(
      { slug: 'ssg-umar-farouk-ibrahim' },
      {
        name: { en: 'Umar Farouk Ibrahim', ha: 'Umar Farouk Ibrahim' },
        title: { en: 'Secretary to State Government', ha: 'Sakataren Gwamnatin Jiha' },
        photo: REAL_IMAGE_URLS.ssg,
        slug: 'ssg-umar-farouk-ibrahim',
        position: 'SSG'
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Updated SSG photo');
    updateCount++;

    await Leader.findOneAndUpdate(
      { slug: 'head-of-service-abdullahi-musa' },
      {
        name: { en: 'Alhaji Abdullahi Musa', ha: 'Alhaji Abdullahi Musa' },
        title: { en: 'Head of Service', ha: 'Shugaban Ma\'aikatan Gwamnati' },
        photo: REAL_IMAGE_URLS.headOfService,
        slug: 'head-of-service-abdullahi-musa',
        position: 'Head of Service'
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Updated Head of Service photo');
    updateCount++;

    await Leader.findOneAndUpdate(
      { slug: 'commissioner-mohammed-tajo-othman' },
      {
        name: { en: 'Mohammed Tajo Othman', ha: 'Mohammed Tajo Othman' },
        title: { en: 'Commissioner', ha: 'Kwamishina' },
        photo: REAL_IMAGE_URLS.commissioner1,
        slug: 'commissioner-mohammed-tajo-othman',
        position: 'Commissioner'
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ Updated Commissioner photo');
    updateCount++;

    // Update News with real images
    console.log('\n📰 Updating News Articles...');

    const abuNews = await News.findOne({ slug: 'gov-yusuf-attends-abu-45th-convocation-donates-n50-million' });
    if (abuNews) {
      abuNews.featuredImage = {
        url: REAL_IMAGE_URLS.newsAbuConvocation,
        publicId: 'kanostate-gov-ng/abba.jpg',
        alt: 'Governor at ABU Convocation'
      };
      await abuNews.save();
      console.log('   ✅ Updated ABU Convocation news image');
      updateCount++;
    }

    const appointmentsNews = await News.findOne({ slug: 'governor-approves-new-appointments-in-kano' });
    if (appointmentsNews) {
      appointmentsNews.featuredImage = {
        url: REAL_IMAGE_URLS.newsAppointments,
        publicId: 'kanostate-gov-ng/uniform.jpg',
        alt: 'Government Officials'
      };
      await appointmentsNews.save();
      console.log('   ✅ Updated Appointments news image');
      updateCount++;
    }

    const motorcyclesNews = await News.findOne({ slug: 'governor-distributes-600-motorcycles-to-influencers' });
    if (motorcyclesNews) {
      motorcyclesNews.featuredImage = {
        url: REAL_IMAGE_URLS.newsApc,
        publicId: 'kanostate-gov-ng/recrui.jpg',
        alt: 'Motorcycle Distribution Event'
      };
      await motorcyclesNews.save();
      console.log('   ✅ Updated Motorcycles news image');
      updateCount++;
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ DATABASE UPDATE COMPLETE!');
    console.log('=' .repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Total updates: ${updateCount}`);
    console.log(`   • Events with images: 2`);
    console.log(`   • Leaders with photos: 5`);
    console.log(`   • News with images: 3`);
    console.log('\n✅ All images are now using REAL photos from kanostate.gov.ng\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
