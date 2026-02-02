#!/usr/bin/env node

/**
 * Direct MongoDB Import for Authentic Kano State Data
 * This script directly inserts data into MongoDB using correct schemas
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models
const Leader = require('../src/models/Leader');
const News = require('../src/models/News');
const HeroBanner = require('../src/models/HeroBanner');
const User = require('../src/models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kano-state-db';

// S3 base URL for uploaded images (we'll use external URLs for now)
const KANO_IMAGES = {
  governorPhoto: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2026/02/Abba.jpg',
  uniformPhoto: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2025/09/Uniform.jpg',
  motorcyclesPhoto: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2026/01/11.jpg',
  kanoLogo: 'https://old.acresal.gov.ng/wp-content/uploads/2023/05/KANO.png',
};

console.log('🏛️  IMPORTING AUTHENTIC KANO STATE DATA (Direct MongoDB)\n');
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

async function getAdminUser() {
  try {
    const admin = await User.findOne({ role: 'super_admin' });
    if (!admin) {
      console.log('⚠️  No admin user found');
      return null;
    }
    console.log(`✅ Found admin user: ${admin.email}\n`);
    return admin._id;
  } catch (error) {
    console.error('❌ Error finding admin user:', error.message);
    return null;
  }
}

async function importLeadership(adminId) {
  console.log('👤 Importing Leadership Data...\n');

  const leaders = [
    {
      name: 'Engineer Abba Kabir Yusuf',
      title: {
        en: 'Governor of Kano State',
        ha: 'Gwamnan Jihar Kano',
        ar: 'حاكم ولاية كانو'
      },
      subtitle: {
        en: '19th Executive Governor',
        ha: 'Gwamna na 19',
        ar: 'الحاكم التنفيذي التاسع عشر'
      },
      position: 'governor',
      profileImage: {
        url: KANO_IMAGES.governorPhoto,
        alt: 'Governor Abba Kabir Yusuf'
      },
      bio: {
        en: 'Engineer Abba Kabir Yusuf was sworn in on May 29, 2023, as the 19th Governor of Kano State. He brings extensive experience in public service and infrastructure development.',
        ha: 'Injiniya Abba Kabir Yusuf ya rantsar a matsayin Gwamna na 19 na Jihar Kano a ranar 29 ga Mayu, 2023.',
        ar: 'أدى المهندس عباس كبير يوسف اليمين في 29 مايو 2023 كحاكم التاسع عشر لولاية كانو.'
      },
      email: 'governor@kanostate.gov.ng',
      phoneNumber: '+2348030000000',
      socialMedia: {
        twitter: 'https://twitter.com/AKY4Kano',
        facebook: 'https://facebook.com/AKY4Kano'
      },
      displayOrder: 1,
      isActive: true,
      appointmentDate: new Date('2023-05-29'),
      createdBy: adminId
    },
    {
      name: 'Comrade Aminu AbdusSalam',
      title: {
        en: 'Deputy Governor of Kano State',
        ha: 'Mataimakin Gwamnan Jihar Kano',
        ar: 'نائب حاكم ولاية كانو'
      },
      position: 'deputy_governor',
      profileImage: {
        url: KANO_IMAGES.uniformPhoto,
        alt: 'Deputy Governor Aminu AbdusSalam'
      },
      bio: {
        en: 'Comrade Aminu AbdusSalam serves as Deputy Governor, working alongside Governor Yusuf to drive development initiatives.',
        ha: 'Kwamared Aminu AbdusSalam yana aiki a matsayin Mataimakin Gwamna.',
        ar: 'يعمل الرفيق أمين عبد السلام كنائب للحاكم.'
      },
      email: 'deputy@kanostate.gov.ng',
      phoneNumber: '+2348030000001',
      displayOrder: 2,
      isActive: true,
      appointmentDate: new Date('2023-05-29'),
      createdBy: adminId
    },
    {
      name: 'Umar Farouk Ibrahim',
      title: {
        en: 'Secretary to the State Government',
        ha: 'Sakataren Gwamnatin Jiha',
        ar: 'أمين حكومة الولاية'
      },
      position: 'other',
      profileImage: {
        url: KANO_IMAGES.uniformPhoto,
        alt: 'SSG Umar Farouk Ibrahim'
      },
      bio: {
        en: 'Umar Farouk Ibrahim coordinates all state ministries, departments and agencies as Secretary to the State Government.',
        ha: 'Umar Farouk Ibrahim yana aiki a matsayin Sakataren Gwamnatin Jiha.',
        ar: 'يعمل عمر فاروق إبراهيم كأمين لحكومة الولاية.'
      },
      email: 'ssg@kanostate.gov.ng',
      phoneNumber: '+2348030000002',
      displayOrder: 3,
      isActive: true,
      createdBy: adminId
    }
  ];

  try {
    // Clear existing leaders
    await Leader.deleteMany({});

    // Insert new leaders
    const result = await Leader.insertMany(leaders);
    console.log(`✅ Imported ${result.length} leaders successfully\n`);
    return result;
  } catch (error) {
    console.error('❌ Error importing leaders:', error.message);
    throw error;
  }
}

async function importNews(adminId) {
  console.log('📰 Importing News Articles...\n');

  const newsArticles = [
    {
      title: {
        en: 'Gov. Yusuf Attends ABU 45th Convocation, Donates N50 Million',
        ha: 'Gwamna Yusuf ya halarta bikin ABU, ya ba da Naira Miliyan 50',
        ar: 'الحاكم يوسف يحضر حفل جامعة أحمدو بيلو ويتبرع بـ50 مليون'
      },
      excerpt: {
        en: 'Governor donates N50 million for Technology Innovation Hub at Ahmadu Bello University.',
        ha: 'Gwamna ya ba da Naira Miliyan 50 don Cibiyar Fasahar Zamani.',
        ar: 'الحاكم يتبرع بـ50 مليون نيرة لمركز الابتكار التكنولوجي.'
      },
      content: {
        en: 'Kano State Governor, Engineer Abba Kabir Yusuf, attended the 45th convocation of Ahmadu Bello University and donated N50 million for a Technology Innovation Hub. This demonstrates his commitment to education and technological advancement.',
        ha: 'Gwamnan Jihar Kano, Injiniya Abba Kabir Yusuf, ya halarta bikin kammala karatun Jami\'ar Ahmadu Bello karo na 45.',
        ar: 'حضر حاكم ولاية كانو حفل التخرج الخامس والأربعين لجامعة أحمدو بيلو.'
      },
      featuredImage: {
        url: KANO_IMAGES.governorPhoto,
        alt: 'Governor at ABU Convocation'
      },
      category: 'education',
      tags: ['Education', 'Technology', 'ABU', 'Innovation'],
      author: adminId,
      authorName: 'Danmewaina',
      status: 'published',
      publishDate: new Date('2026-02-02'),
      featured: true,
      createdBy: adminId
    },
    {
      title: {
        en: 'Governor Approves New Appointments in Kano',
        ha: 'Gwamna ya amince da sabbin nadi',
        ar: 'الحاكم يوافق على تعيينات جديدة'
      },
      excerpt: {
        en: 'Governor approves new appointments and promotions to strengthen government administration.',
        ha: 'Gwamna ya amince da sabbin nadi don ƙarfafa tsarin mulki.',
        ar: 'الحاكم يوافق على تعيينات جديدة لتعزيز الإدارة.'
      },
      content: {
        en: 'Kano State Governor has approved new appointments and promotions for state officials to enhance efficiency and effectiveness of government operations.',
        ha: 'Gwamnan Jihar Kano ya amince da sabbin nadi da ƙara matsayin jami\'an gwamnati.',
        ar: 'وافق حاكم ولاية كانو على تعيينات وترقيات جديدة.'
      },
      featuredImage: {
        url: KANO_IMAGES.uniformPhoto,
        alt: 'Government Officials'
      },
      category: 'government',
      tags: ['Appointments', 'Government', 'Administration'],
      author: adminId,
      authorName: 'Danmewaina',
      status: 'published',
      publishDate: new Date('2026-01-28'),
      featured: false,
      createdBy: adminId
    },
    {
      title: {
        en: 'Governor Distributes 600 Motorcycles to Influencers',
        ha: 'Gwamna ya raba babura 600',
        ar: 'الحاكم يوزع 600 دراجة نارية'
      },
      excerpt: {
        en: 'Governor distributes 600 motorcycles to social media influencers for youth empowerment.',
        ha: 'Gwamna ya raba babura 600 don tallafawa matasa.',
        ar: 'الحاكم يوزع 600 دراجة نارية لتمكين الشباب.'
      },
      content: {
        en: 'In an innovative youth engagement approach, Governor Yusuf distributed 600 motorcycles to social media influencers, recognizing the role of digital communication in modern governance.',
        ha: 'Gwamnan Yusuf ya raba babura 600 ga masu tasiri a kafofin sada zumunta.',
        ar: 'وزع الحاكم يوسف 600 دراجة نارية على المؤثرين على وسائل التواصل.'
      },
      featuredImage: {
        url: KANO_IMAGES.motorcyclesPhoto,
        alt: 'Motorcycle Distribution'
      },
      category: 'development',
      tags: ['Youth', 'Social Media', 'Empowerment'],
      author: adminId,
      authorName: 'Danmewaina',
      status: 'published',
      publishDate: new Date('2026-01-24'),
      featured: true,
      createdBy: adminId
    }
  ];

  try {
    // Clear existing news
    await News.deleteMany({});

    // Insert new news articles
    const result = await News.insertMany(newsArticles);
    console.log(`✅ Imported ${result.length} news articles successfully\n`);
    return result;
  } catch (error) {
    console.error('❌ Error importing news:', error.message);
    throw error;
  }
}

async function importHeroBanners(adminId) {
  console.log('🎨 Importing Hero Banners...\n');

  const banners = [
    {
      title: {
        en: 'Welcome to Kano State',
        ha: 'Maraba da Jihar Kano',
        ar: 'مرحباً بكم في ولاية كانو'
      },
      subtitle: {
        en: 'The Center of Commerce',
        ha: 'Cibiyar Kasuwanci',
        ar: 'مركز التجارة'
      },
      description: {
        en: 'Kano State - Nigeria\'s historic commercial hub, driving innovation and prosperity.',
        ha: 'Jihar Kano - Cibiyar kasuwanci ta Najeriya.',
        ar: 'ولاية كانو - مركز نيجيريا التجاري التاريخي.'
      },
      image: {
        url: KANO_IMAGES.governorPhoto,
        alt: 'Kano State Government'
      },
      ctaButton: {
        text: {
          en: 'Explore Services',
          ha: 'Bincika Ayyuka',
          ar: 'استكشف الخدمات'
        },
        url: '/services',
        openInNewTab: false
      },
      displayOrder: 1,
      isActive: true,
      createdBy: adminId
    }
  ];

  try {
    // Clear existing banners
    await HeroBanner.deleteMany({});

    // Insert new banners
    const result = await HeroBanner.insertMany(banners);
    console.log(`✅ Imported ${result.length} hero banners successfully\n`);
    return result;
  } catch (error) {
    console.error('❌ Error importing banners:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();

    const adminId = await getAdminUser();
    if (!adminId) {
      console.log('⚠️  Skipping import - no admin user found');
      process.exit(1);
    }

    await importLeadership(adminId);
    await importNews(adminId);
    await importHeroBanners(adminId);

    console.log('=========================================================');
    console.log('✅ IMPORT COMPLETE!\n');
    console.log('All authentic Kano State data has been imported.');
    console.log('Visit http://localhost:5173 to see the updated content.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();