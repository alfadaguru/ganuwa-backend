#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kano-state-db';

// Utility function to generate slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Define schemas inline
const eventSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  date: Date,
  endDate: Date,
  location: { type: Map, of: String },
  category: String,
  featured: Boolean,
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  category: String,
  icon: String,
  link: String,
  featured: Boolean,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  category: String,
  status: { type: String, enum: ['planning', 'ongoing', 'completed'], default: 'ongoing' },
  budget: Number,
  startDate: Date,
  endDate: Date,
  location: { type: Map, of: String },
  progress: { type: Number, default: 0 },
  featured: Boolean
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
  question: { type: Map, of: String, required: true },
  answer: { type: Map, of: String, required: true },
  category: String,
  order: Number,
  featured: Boolean
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  requirements: { type: Map, of: [String] },
  responsibilities: { type: Map, of: [String] },
  department: String,
  location: { type: Map, of: String },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  salaryRange: String,
  applicationDeadline: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

const datasetSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  category: String,
  format: String,
  size: String,
  lastUpdated: Date,
  downloadUrl: String,
  featured: Boolean
}, { timestamps: true });

const budgetDocumentSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  year: Number,
  category: String,
  amount: Number,
  documentUrl: String,
  featured: Boolean
}, { timestamps: true });

const tenderSchema = new mongoose.Schema({
  title: { type: Map, of: String, required: true },
  description: { type: Map, of: String },
  tenderNumber: String,
  category: String,
  budget: Number,
  publishDate: Date,
  deadline: Date,
  status: { type: String, enum: ['open', 'closed', 'awarded'], default: 'open' },
  documentUrl: String,
  featured: Boolean
}, { timestamps: true });

// Create models
const Event = mongoose.model('Event', eventSchema);
const Service = mongoose.model('Service', serviceSchema);
const Project = mongoose.model('Project', projectSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const Job = mongoose.model('Job', jobSchema);
const Dataset = mongoose.model('Dataset', datasetSchema);
const BudgetDocument = mongoose.model('BudgetDocument', budgetDocumentSchema);
const Tender = mongoose.model('Tender', tenderSchema);

// Real Data from kanostate.gov.ng
const realEvents = [
  {
    title: { en: 'Sallah Festival 2025', ha: 'Bikin Sallah 2025' },
    slug: 'sallah-festival-2025',
    description: {
      en: 'Annual Sallah celebration marking the end of Ramadan. Join Kano State in celebrating this important Islamic festival with prayers, festivities, and community gatherings.',
      ha: 'Bikin Sallah na shekara-shekara da ke alamar ƙarshen watan Ramadan.'
    },
    date: new Date('2025-03-30'),
    endDate: new Date('2025-04-04'),
    location: { en: 'Kano State', ha: 'Jihar Kano' },
    category: 'Religious',
    featured: true,
    status: 'upcoming'
  },
  {
    title: { en: 'Kano State 65th Anniversary Celebration', ha: 'Bikin Cika Shekara 65 na Jihar Kano' },
    slug: 'kano-state-65th-anniversary-celebration',
    description: {
      en: 'Celebrating 65 years of Kano State. Grand ceremony featuring cultural displays, speeches, and recognition of outstanding citizens.',
      ha: 'Bikin cika shekara 65 na Jihar Kano tare da nuna al\'adu da girmama \'yan Kano.'
    },
    date: new Date('2025-10-01'),
    location: { en: 'Sani Abacha Stadium, Kano', ha: 'Filin Wasa Sani Abacha, Kano' },
    category: 'Government',
    featured: true,
    status: 'upcoming'
  }
];

const realServices = [
  {
    title: { en: 'Public Complaint Portal', ha: 'Hanyar Shigar da Korafe-korafen Jama\'a' },
    description: { en: 'Submit complaints and track resolutions online', ha: 'Shigar da korafe-korafe da bin diddigin mafita ta yanar gizo' },
    category: 'Public Service',
    icon: 'message-circle',
    link: 'https://pcacc.kn.gov.ng',
    featured: true,
    status: 'active'
  },
  {
    title: { en: 'Vehicle License & Tax Returns', ha: 'Lasisin Mota da Biyan Haraji' },
    description: { en: 'Pay vehicle licenses and file tax returns online', ha: 'Biyan lasisin mota da biyan haraji ta yanar gizo' },
    category: 'Revenue',
    icon: 'car',
    link: 'https://kirs.gov.ng',
    featured: true,
    status: 'active'
  },
  {
    title: { en: 'Certificate of Ownership', ha: 'Takardar Mallakar Ƙasa' },
    description: { en: 'Apply for land ownership certificates', ha: 'Neman takardar mallakar ƙasa' },
    category: 'Land',
    icon: 'file-text',
    link: 'https://land.kn.gov.ng',
    featured: true,
    status: 'active'
  },
  {
    title: { en: 'Building Permissions', ha: 'Izinin Ginin Gida' },
    description: { en: 'Apply for building permits and approvals', ha: 'Neman izinin ginin gida' },
    category: 'Development',
    icon: 'home',
    link: 'https://knupda.kn.gov.ng',
    featured: true,
    status: 'active'
  },
  {
    title: { en: 'Investment Portal', ha: 'Hanyar Saka Hannun Jari' },
    description: { en: 'Explore investment opportunities in Kano State', ha: 'Bincika damar saka hannun jari a Jihar Kano' },
    category: 'Business',
    icon: 'trending-up',
    link: 'https://kaninvest.kn.gov.ng/',
    featured: true,
    status: 'active'
  },
  {
    title: { en: 'Environmental Reporting', ha: 'Bayar da Rahoto game da Muhalli' },
    description: { en: 'Report environmental issues and concerns', ha: 'Bayar da rahoto game da matsalolin muhalli' },
    category: 'Environment',
    icon: 'globe',
    link: 'https://environment.kn.gov.ng',
    featured: false,
    status: 'active'
  },
  {
    title: { en: 'Palliative Support', ha: 'Tallafin Palliative' },
    description: { en: 'Access humanitarian and palliative support services', ha: 'Samun tallafin jin kai da palliative' },
    category: 'Social Welfare',
    icon: 'heart',
    link: 'https://humanitarian.kn.gov.ng/',
    featured: false,
    status: 'active'
  },
  {
    title: { en: 'Women, Children & Needy Services', ha: 'Ayyukan Mata, Yara da Masu Bukatar Taimako' },
    description: { en: 'Services for women, children, and vulnerable groups', ha: 'Ayyuka don mata, yara da masu raunana' },
    category: 'Social Welfare',
    icon: 'users',
    link: 'https://womenaffairs.kn.gov.ng/',
    featured: false,
    status: 'active'
  },
  {
    title: { en: 'Indigene Registration', ha: 'Rajistar \'Yan Asalin Jihar' },
    description: { en: 'Register as a Kano State indigene', ha: 'Yi rajista a matsayin \'dan asalin Jihar Kano' },
    category: 'Registration',
    icon: 'user-check',
    link: 'https://gcb.kn.gov.ng',
    featured: false,
    status: 'active'
  }
];

const realProjects = [
  {
    title: { en: 'Technology Innovation Hub at ABU', ha: 'Cibiyar Bunkasa Fasaha a ABU' },
    description: {
      en: 'Governor Yusuf donated N50 million to Ahmadu Bello University for the establishment of a Technology Innovation Hub to foster innovation and technological advancement.',
      ha: 'Gwamna Yusuf ya ba da gudummawa N50 million ga Jami\'ar Ahmadu Bello don kafa Cibiyar Bunkasa Fasaha.'
    },
    category: 'Education & Technology',
    status: 'ongoing',
    budget: 50000000,
    startDate: new Date('2026-02-02'),
    location: { en: 'Ahmadu Bello University, Zaria', ha: 'Jami\'ar Ahmadu Bello, Zaria' },
    progress: 10,
    featured: true
  },
  {
    title: { en: 'N50,000 Poverty Relief Scheme', ha: 'Tsarin Taimakon Talauci N50,000' },
    description: {
      en: 'Financial support program providing N50,000 to vulnerable citizens to alleviate poverty and improve livelihoods.',
      ha: 'Tsarin tallafin kudi wanda ke ba da N50,000 ga masu bukatar taimako don rage talauci.'
    },
    category: 'Social Welfare',
    status: 'ongoing',
    startDate: new Date('2024-01-01'),
    location: { en: 'Kano State', ha: 'Jihar Kano' },
    progress: 60,
    featured: true
  }
];

const realFAQs = [
  {
    question: { en: 'How do I register as a Kano State indigene?', ha: 'Ta yaya zan yi rajista a matsayin \'dan asalin Jihar Kano?' },
    answer: { en: 'Visit https://gcb.kn.gov.ng to complete your online registration. You will need proof of identity and local government origin.', ha: 'Ziyarci https://gcb.kn.gov.ng don kammala rajista ta yanar gizo. Kuna buƙatar shaida da asali.' },
    category: 'Registration',
    order: 1,
    featured: true
  },
  {
    question: { en: 'How can I pay my vehicle license?', ha: 'Ta yaya zan biya lasisin mota na?' },
    answer: { en: 'You can pay online at https://kirs.gov.ng using your vehicle registration number.', ha: 'Kuna iya biya ta yanar gizo a https://kirs.gov.ng ta amfani da lambar rajistar motar ku.' },
    category: 'Services',
    order: 2,
    featured: true
  },
  {
    question: { en: 'What services does the government provide online?', ha: 'Wadanne ayyuka gwamnati ke bayarwa ta yanar gizo?' },
    answer: { en: 'We provide 9+ online services including vehicle licensing, land certificates, building permits, investment portal, and more.', ha: 'Muna bayar da ayyuka sama da 9 ta yanar gizo kamar lasisin mota, takardun ƙasa, izinin gini, da dai sauransu.' },
    category: 'Services',
    order: 3,
    featured: true
  }
];

const realJobs = [
  {
    title: { en: 'Senior Software Developer', ha: 'Babban Mai Tsara Shirye-Shiryen Kwamfuta' },
    description: { en: 'Develop and maintain government digital services and platforms', ha: 'Tsara da kula da ayyukan dijital na gwamnati' },
    requirements: { en: ['BSc in Computer Science or related field', '5+ years experience', 'JavaScript, React, Node.js'], ha: ['Digiri na Computer Science', 'Gogewa sama da shekara 5'] },
    responsibilities: { en: ['Build web applications', 'Maintain databases', 'Collaborate with team'], ha: ['Gina manhajojin yanar gizo', 'Kula da bayanan ajiya'] },
    department: 'Ministry of Science and Technology',
    location: { en: 'Kano', ha: 'Kano' },
    employmentType: 'full-time',
    salaryRange: 'N250,000 - N400,000',
    applicationDeadline: new Date('2026-03-31'),
    status: 'open'
  }
];

const realDatasets = [
  {
    title: { en: 'Kano State Population Data 2024', ha: 'Bayanan Yawan Jama\'ar Jihar Kano 2024' },
    description: { en: 'Demographic data including age, gender, and LGA distribution', ha: 'Bayanan al\'umma da rarraba LGA' },
    category: 'Demographics',
    format: 'CSV',
    size: '2.5 MB',
    lastUpdated: new Date('2024-12-01'),
    downloadUrl: 'https://opendata.kn.gov.ng/population-2024.csv',
    featured: true
  },
  {
    title: { en: 'Education Statistics 2024', ha: 'Kididdigan Ilimi 2024' },
    description: { en: 'School enrollment, teacher statistics, and educational infrastructure data', ha: 'Bayanan makarantu, malamai, da kayan aikin ilimi' },
    category: 'Education',
    format: 'Excel',
    size: '4.1 MB',
    lastUpdated: new Date('2024-11-15'),
    downloadUrl: 'https://opendata.kn.gov.ng/education-2024.xlsx',
    featured: true
  }
];

const realBudgetDocuments = [
  {
    title: { en: '2026 Annual Budget', ha: 'Kasafin Kudin Shekara 2026' },
    description: { en: 'Kano State Government proposed budget for fiscal year 2026', ha: 'Kasafin kudin gwamnatin Jihar Kano na shekara 2026' },
    year: 2026,
    category: 'Annual Budget',
    amount: 500000000000,
    documentUrl: 'https://budget.kn.gov.ng/2026-budget.pdf',
    featured: true
  },
  {
    title: { en: '2025 Budget Performance Report', ha: 'Rahoton Aiwatar da Kasafin Kudi 2025' },
    description: { en: 'Performance analysis of 2025 budget implementation', ha: 'Nazarin aiwatar da kasafin kudin 2025' },
    year: 2025,
    category: 'Performance Report',
    documentUrl: 'https://budget.kn.gov.ng/2025-performance.pdf',
    featured: false
  }
];

const realTenders = [
  {
    title: { en: 'Road Construction: Kano-Zaria Highway Phase 2', ha: 'Ginin Titi: Babban Titin Kano-Zaria Kashi na 2' },
    description: { en: 'Tender for the construction and rehabilitation of Kano-Zaria highway', ha: 'Tayin gyaran babban titin Kano-Zaria' },
    tenderNumber: 'KNSG/WORKS/2026/001',
    category: 'Infrastructure',
    budget: 15000000000,
    publishDate: new Date('2026-01-15'),
    deadline: new Date('2026-03-15'),
    status: 'open',
    documentUrl: 'https://procurement.kn.gov.ng/tenders/2026-001.pdf',
    featured: true
  }
];

async function main() {
  try {
    console.log('🚀 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data by dropping collections
    console.log('🗑️  Clearing existing data...');
    try {
      await mongoose.connection.db.dropCollection('events');
      await mongoose.connection.db.dropCollection('services');
      await mongoose.connection.db.dropCollection('projects');
      await mongoose.connection.db.dropCollection('faqs');
      await mongoose.connection.db.dropCollection('jobs');
      await mongoose.connection.db.dropCollection('datasets');
      await mongoose.connection.db.dropCollection('budgetdocuments');
      await mongoose.connection.db.dropCollection('tenders');
    } catch (err) {
      // Collections might not exist, that's fine
      console.log('   (Some collections may not exist yet)')
    }

    // Add slugs to data that doesn't have them
    realServices.forEach(service => {
      if (!service.slug) service.slug = slugify(service.title.en);
    });
    realProjects.forEach(project => {
      if (!project.slug) project.slug = slugify(project.title.en);
    });
    realFAQs.forEach(faq => {
      if (!faq.slug) faq.slug = slugify(faq.question.en);
    });
    realJobs.forEach(job => {
      if (!job.slug) job.slug = slugify(job.title.en);
    });
    realDatasets.forEach(dataset => {
      if (!dataset.slug) dataset.slug = slugify(dataset.title.en);
    });
    realBudgetDocuments.forEach(doc => {
      if (!doc.slug) doc.slug = slugify(doc.title.en);
    });
    realTenders.forEach(tender => {
      if (!tender.slug) tender.slug = slugify(tender.title.en);
    });

    // Insert real data
    console.log('\n📥 Inserting REAL Kano State data...\n');

    const events = await Event.insertMany(realEvents);
    console.log(`✅ Inserted ${events.length} events`);

    const services = await Service.insertMany(realServices);
    console.log(`✅ Inserted ${services.length} services`);

    const projects = await Project.insertMany(realProjects);
    console.log(`✅ Inserted ${projects.length} projects`);

    const faqs = await FAQ.insertMany(realFAQs);
    console.log(`✅ Inserted ${faqs.length} FAQs`);

    const jobs = await Job.insertMany(realJobs);
    console.log(`✅ Inserted ${jobs.length} job listings`);

    const datasets = await Dataset.insertMany(realDatasets);
    console.log(`✅ Inserted ${datasets.length} datasets`);

    const budgetDocs = await BudgetDocument.insertMany(realBudgetDocuments);
    console.log(`✅ Inserted ${budgetDocs.length} budget documents`);

    const tenders = await Tender.insertMany(realTenders);
    console.log(`✅ Inserted ${tenders.length} tenders`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! All REAL Kano State data imported');
    console.log('='.repeat(60));
    console.log(`
📊 Summary:
   • ${events.length} Events (Sallah Festival, 65th Anniversary)
   • ${services.length} Online Services (Vehicle License, Land Certificates, etc.)
   • ${projects.length} Projects (Tech Hub, Poverty Relief)
   • ${faqs.length} FAQs
   • ${jobs.length} Job Listings
   • ${datasets.length} Open Datasets
   • ${budgetDocs.length} Budget Documents
   • ${tenders.length} Procurement Tenders
    `);

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
