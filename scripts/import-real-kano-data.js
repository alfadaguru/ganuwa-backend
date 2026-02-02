#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5001/api/v1';

// Get auth token from environment or use default test token
const AUTH_TOKEN = process.env.ADMIN_TOKEN || '';

console.log('🏛️  IMPORTING AUTHENTIC KANO STATE DATA\n');
console.log('========================================\n');

// Helper function to upload file to S3 via backend
async function uploadFileToS3(filePath, fieldName = 'file') {
  try {
    const form = new FormData();
    form.append(fieldName, fs.createReadStream(filePath));

    const response = await axios.post(`${API_BASE_URL}/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    return response.data.data.url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to download image from URL
async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filepath = path.join(__dirname, '../temp-kano-assets', filename);
    const writer = fs.createWriteStream(filepath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filepath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

// 1. UPDATE LEADERSHIP DATA
async function importLeadershipData() {
  console.log('👤 Importing Leadership Data...\n');

  const leaders = [
    {
      name: { en: 'Engineer Abba Kabir Yusuf', ha: 'Injiniya Abba Kabir Yusuf', ar: 'المهندس عباس كبير يوسف' },
      position: { en: 'Governor of Kano State', ha: 'Gwamnan Jihar Kano', ar: 'حاكم ولاية كانو' },
      category: 'governor',
      bio: {
        en: 'Engineer Abba Kabir Yusuf was sworn in on May 29, 2023, as the 19th Governor of Kano State. He brings extensive experience in public service and infrastructure development to the role.',
        ha: 'Injiniya Abba Kabir Yusuf ya rantsar a matsayin Gwamna na 19 na Jihar Kano a ranar 29 ga Mayu, 2023.',
        ar: 'أدى المهندس عباس كبير يوسف اليمين في 29 مايو 2023 كحاكم التاسع عشر لولاية كانو.'
      },
      contact: {
        email: 'governor@kanostate.gov.ng',
        phone: '+2348030000000'
      },
      socialMedia: {
        twitter: 'https://twitter.com/AKY4Kano',
        facebook: 'https://facebook.com/AKY4Kano'
      },
      status: 'active',
      priority: 1,
      imageFilename: 'gov-abu-1.jpg'
    },
    {
      name: { en: 'Comrade Aminu AbdusSalam', ha: 'Kwamared Aminu AbdusSalam', ar: 'الرفيق أمين عبد السلام' },
      position: { en: 'Deputy Governor of Kano State', ha: 'Mataimakin Gwamnan Jihar Kano', ar: 'نائب حاكم ولاية كانو' },
      category: 'deputy-governor',
      bio: {
        en: 'Comrade Aminu AbdusSalam serves as the Deputy Governor of Kano State, working alongside Governor Yusuf to drive development initiatives across the state.',
        ha: 'Kwamared Aminu AbdusSalam yana aiki a matsayin Mataimakin Gwamnan Jihar Kano.',
        ar: 'يعمل الرفيق أمين عبد السلام كنائب لحاكم ولاية كانو.'
      },
      contact: {
        email: 'deputy@kanostate.gov.ng',
        phone: '+2348030000001'
      },
      status: 'active',
      priority: 2,
      imageFilename: null
    },
    {
      name: { en: 'Umar Farouk Ibrahim', ha: 'Umar Farouk Ibrahim', ar: 'عمر فاروق إبراهيم' },
      position: { en: 'Secretary to the State Government', ha: 'Sakataren Gwamnatin Jiha', ar: 'أمين حكومة الولاية' },
      category: 'cabinet',
      bio: {
        en: 'Umar Farouk Ibrahim serves as the Secretary to the State Government, coordinating the activities of all state ministries, departments and agencies.',
        ha: 'Umar Farouk Ibrahim yana aiki a matsayin Sakataren Gwamnatin Jiha.',
        ar: 'يعمل عمر فاروق إبراهيم كأمين لحكومة الولاية.'
      },
      contact: {
        email: 'ssg@kanostate.gov.ng',
        phone: '+2348030000002'
      },
      status: 'active',
      priority: 3,
      imageFilename: null
    }
  ];

  for (const leader of leaders) {
    try {
      // Upload image if exists
      if (leader.imageFilename) {
        const imagePath = path.join(__dirname, '../temp-kano-assets', leader.imageFilename);
        if (fs.existsSync(imagePath)) {
          const imageUrl = await uploadFileToS3(imagePath, 'image');
          if (imageUrl) {
            leader.photo = { url: imageUrl, alt: leader.name.en };
          }
        }
      }

      delete leader.imageFilename;

      const response = await axios.post(`${API_BASE_URL}/leaders`, leader, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });

      console.log(`✅ Imported: ${leader.name.en}`);
    } catch (error) {
      console.error(`❌ Error importing ${leader.name.en}:`, error.response?.data || error.message);
    }
  }

  console.log('\n');
}

// 2. IMPORT REAL NEWS ARTICLES
async function importNewsArticles() {
  console.log('📰 Importing News Articles...\n');

  const newsArticles = [
    {
      title: {
        en: 'Gov. Yusuf Attends ABU 45th Convocation, Donates N50 Million for Technology Innovation Hub',
        ha: 'Gwamna Yusuf ya halarta bikin kammala karatun ABU na 45, ya ba da kyautar Naira Miliyan 50 don Cibiyar Fasahar Zamani',
        ar: 'الحاكم يوسف يحضر حفل التخرج الـ45 لجامعة أحمدو بيلو ويتبرع بـ50 مليون نيرة لمركز الابتكار التكنولوجي'
      },
      summary: {
        en: 'Kano State Governor, Engineer Abba Kabir Yusuf, attended the 45th convocation ceremony of Ahmadu Bello University and donated N50 million towards the establishment of a Technology Innovation Hub.',
        ha: 'Gwamnan Jihar Kano, Injiniya Abba Kabir Yusuf, ya halarta bikin kammala karatun Jami\'ar Ahmadu Bello karo na 45 kuma ya bayar da kyautar Naira Miliyan 50 don kafa Cibiyar Fasahar Zamani.',
        ar: 'حضر حاكم ولاية كانو، المهندس عباس كبير يوسف، حفل التخرج الخامس والأربعين لجامعة أحمدو بيلو وتبرع بمبلغ 50 مليون نيرة لإنشاء مركز للابتكار التكنولوجي.'
      },
      content: {
        en: 'Kano State Governor, Engineer Abba Kabir Yusuf, has demonstrated his commitment to education and technological advancement by attending the 45th convocation ceremony of Ahmadu Bello University (ABU) Zaria. During the ceremony, Governor Yusuf announced a generous donation of N50 million towards the establishment of a Technology Innovation Hub at the university. This initiative aligns with the state government\'s vision to promote innovation, entrepreneurship, and technological development among young Nigerians. The Technology Innovation Hub will provide students and researchers with state-of-the-art facilities to develop cutting-edge solutions to societal challenges.',
        ha: 'Gwamnan Jihar Kano, Injiniya Abba Kabir Yusuf, ya nuna sadaukarwarsa ga ilimi da ci gaban fasaha ta hanyar halartar bikin kammala karatun Jami\'ar Ahmadu Bello (ABU) Zaria karo na 45. A lokacin bikin, Gwamna Yusuf ya sanar da kyautar Naira Miliyan 50 don kafa Cibiyar Fasahar Zamani a jami\'ar. Wannan shiri ya dace da manufar gwamnatin jihar ta inganta kirkiro, kasuwanci, da ci gaban fasaha a tsakanin matasan Najeriya.',
        ar: 'أظهر حاكم ولاية كانو، المهندس عباس كبير يوسف، التزامه بالتعليم والتقدم التكنولوجي من خلال حضور حفل التخرج الخامس والأربعين لجامعة أحمدو بيلو (ABU) زاريا. وخلال الحفل، أعلن الحاكم يوسف عن تبرع سخي بمبلغ 50 مليون نيرة لإنشاء مركز للابتكار التكنولوجي بالجامعة.'
      },
      author: { name: 'Danmewaina', email: 'danmewaina@kanostate.gov.ng' },
      category: 'education',
      tags: ['Education', 'Technology', 'ABU', 'Innovation', 'Governor'],
      publishedDate: new Date('2026-02-02'),
      status: 'published',
      featured: true,
      imageUrl: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2026/02/Abba.jpg',
      imageFilename: 'gov-abu-1.jpg'
    },
    {
      title: {
        en: 'Governor Yusuf Approves New Appointments, Promotes Other Officials in Kano',
        ha: 'Gwamna Yusuf ya amince da sabbin nadi, ya ƙara matsayin wasu jami\'ai a Kano',
        ar: 'الحاكم يوسف يوافق على تعيينات جديدة ويرقي مسؤولين آخرين في كانو'
      },
      summary: {
        en: 'Kano State Governor approves new appointments and promotions for state officials in a move to strengthen government administration.',
        ha: 'Gwamnan Jihar Kano ya amince da sabbin nadi da ƙara matsayin jami\'an gwamnati don ƙarfafa tsarin mulki.',
        ar: 'حاكم ولاية كانو يوافق على تعيينات وترقيات جديدة للمسؤولين الحكوميين في خطوة لتعزيز الإدارة الحكومية.'
      },
      content: {
        en: 'In a significant administrative move, Kano State Governor, Engineer Abba Kabir Yusuf, has approved new appointments and promotions for various state officials. This restructuring aims to enhance the efficiency and effectiveness of state government operations. The appointments reflect the governor\'s commitment to merit-based advancement and professional excellence in public service.',
        ha: 'A wani muhimmin mataki na gudanarwa, Gwamnan Jihar Kano, Injiniya Abba Kabir Yusuf, ya amince da sabbin nadi da ƙara matsayin jami\'an gwamnati daban-daban. Wannan sake tsarawa na da nufin haɓaka inganci da tasiri na ayyukan gwamnatin jiha.',
        ar: 'في خطوة إدارية مهمة، وافق حاكم ولاية كانو، المهندس عباس كبير يوسف، على تعيينات وترقيات جديدة لمسؤولين حكوميين مختلفين. تهدف هذه إعادة الهيكلة إلى تعزيز كفاءة وفعالية عمليات الحكومة الولائية.'
      },
      author: { name: 'Danmewaina', email: 'danmewaina@kanostate.gov.ng' },
      category: 'government',
      tags: ['Appointments', 'Government', 'Administration', 'Kano State'],
      publishedDate: new Date('2026-01-28'),
      status: 'published',
      featured: false,
      imageUrl: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2025/09/Uniform.jpg',
      imageFilename: 'gov-uniform.jpg'
    },
    {
      title: {
        en: 'Governor Yusuf Distributes 600 Motorcycles to Social Media Influencers',
        ha: 'Gwamna Yusuf ya raba babura 600 ga masu tasiri a kafofin sada zumunta',
        ar: 'الحاكم يوسف يوزع 600 دراجة نارية على المؤثرين على وسائل التواصل الاجتماعي'
      },
      summary: {
        en: 'Kano State Governor distributes 600 motorcycles to social media influencers to support youth empowerment and digital communication.',
        ha: 'Gwamnan Jihar Kano ya raba babura 600 ga masu tasiri a kafofin sada zumunta don tallafawa matasa da sadarwar dijital.',
        ar: 'حاكم ولاية كانو يوزع 600 دراجة نارية على المؤثرين على وسائل التواصل الاجتماعي لدعم تمكين الشباب والاتصال الرقمي.'
      },
      content: {
        en: 'In an innovative approach to youth engagement, Kano State Governor, Engineer Abba Kabir Yusuf, has distributed 600 motorcycles to social media influencers across the state. This initiative recognizes the important role of digital communication in modern governance and aims to empower young content creators while enhancing the dissemination of government information to citizens. The program demonstrates the administration\'s commitment to leveraging technology and new media for effective public engagement.',
        ha: 'A wata sabuwar hanya ta haɗa kai da matasa, Gwamnan Jihar Kano, Injiniya Abba Kabir Yusuf, ya raba babura 600 ga masu tasiri a kafofin sada zumunta a duk faɗin jihar. Wannan shiri ya gane muhimmancin rawar da sadarwar dijital ke takawa a mulkin zamani.',
        ar: 'في نهج مبتكر لإشراك الشباب، وزع حاكم ولاية كانو، المهندس عباس كبير يوسف، 600 دراجة نارية على المؤثرين على وسائل التواصل الاجتماعي في جميع أنحاء الولاية. تعترف هذه المبادرة بالدور المهم للاتصال الرقمي في الحكم الحديث.'
      },
      author: { name: 'Danmewaina', email: 'danmewaina@kanostate.gov.ng' },
      category: 'community',
      tags: ['Youth Empowerment', 'Social Media', 'Digital Communication', 'Motorcycles'],
      publishedDate: new Date('2026-01-24'),
      status: 'published',
      featured: true,
      imageUrl: 'https://i0.wp.com/kanostate.gov.ng/wp-content/uploads/2026/01/11.jpg',
      imageFilename: 'gov-motorcycles.jpg'
    }
  ];

  for (const article of newsArticles) {
    try {
      // Upload featured image if exists
      if (article.imageFilename) {
        const imagePath = path.join(__dirname, '../temp-kano-assets', article.imageFilename);
        if (fs.existsSync(imagePath)) {
          const imageUrl = await uploadFileToS3(imagePath, 'featuredImage');
          if (imageUrl) {
            article.featuredImage = { url: imageUrl, alt: article.title.en };
          }
        }
      }

      delete article.imageFilename;
      delete article.imageUrl;

      const response = await axios.post(`${API_BASE_URL}/news`, article, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });

      console.log(`✅ Imported: ${article.title.en.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Error importing article:`, error.response?.data || error.message);
    }
  }

  console.log('\n');
}

// 3. UPDATE HERO BANNERS
async function importHeroBanners() {
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
        en: 'Kano State - Nigeria\'s historic commercial hub, driving innovation, development, and prosperity for all citizens.',
        ha: 'Jihar Kano - Cibiyar kasuwanci mai tarihi ta Najeriya, tana jagorantar kirkiro, ci gaba, da wadata ga dukkan \'yan kasa.',
        ar: 'ولاية كانو - مركز نيجيريا التجاري التاريخي، يقود الابتكار والتنمية والازدهار لجميع المواطنين.'
      },
      ctaText: { en: 'Explore Services', ha: 'Bincika Ayyuka', ar: 'استكشف الخدمات' },
      ctaLink: '/services',
      priority: 1,
      status: 'active',
      imageFilename: 'gov-abu-1.jpg'
    }
  ];

  for (const banner of banners) {
    try {
      // Upload background image
      if (banner.imageFilename) {
        const imagePath = path.join(__dirname, '../temp-kano-assets', banner.imageFilename);
        if (fs.existsSync(imagePath)) {
          const imageUrl = await uploadFileToS3(imagePath, 'backgroundImage');
          if (imageUrl) {
            banner.backgroundImage = { url: imageUrl, alt: banner.title.en };
          }
        }
      }

      delete banner.imageFilename;

      const response = await axios.post(`${API_BASE_URL}/hero-banners`, banner, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });

      console.log(`✅ Imported: ${banner.title.en}`);
    } catch (error) {
      console.error(`❌ Error importing banner:`, error.response?.data || error.message);
    }
  }

  console.log('\n');
}

// Main execution
async function main() {
  try {
    await importLeadershipData();
    await importNewsArticles();
    await importHeroBanners();

    console.log('========================================');
    console.log('✅ IMPORT COMPLETE!\n');
    console.log('All authentic Kano State data has been imported successfully.');
    console.log('Please visit the website to see the updated content.\n');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();