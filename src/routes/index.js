const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const newsRoutes = require('./news.routes');
const leaderRoutes = require('./leader.routes');
const serviceRoutes = require('./service.routes');
const projectRoutes = require('./project.routes');
const mdaRoutes = require('./mda.routes');
const lgaRoutes = require('./lga.routes');
const eventRoutes = require('./event.routes');
const announcementRoutes = require('./announcement.routes');
const pressReleaseRoutes = require('./pressRelease.routes');
const mediaRoutes = require('./media.routes');
const heroBannerRoutes = require('./heroBanner.routes');
const quickLinkRoutes = require('./quickLink.routes');
const contactRoutes = require('./contact.routes');
const pageRoutes = require('./page.routes');
const faqRoutes = require('./faq.routes');
const subscriberRoutes = require('./subscriber.routes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./upload.routes');
const budgetDocumentRoutes = require('./budgetDocument.routes');
const tenderRoutes = require('./tender.routes');
const jobRoutes = require('./job.routes');
const foiRequestRoutes = require('./foiRequest.routes');
const datasetRoutes = require('./dataset.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/news', newsRoutes);
router.use('/leaders', leaderRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/mdas', mdaRoutes);
router.use('/lgas', lgaRoutes);
router.use('/events', eventRoutes);
router.use('/announcements', announcementRoutes);
router.use('/press-releases', pressReleaseRoutes);
router.use('/media', mediaRoutes);
router.use('/hero-banners', heroBannerRoutes);
router.use('/quick-links', quickLinkRoutes);
router.use('/contacts', contactRoutes);
router.use('/pages', pageRoutes);
router.use('/faqs', faqRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/upload', uploadRoutes);
router.use('/budget-documents', budgetDocumentRoutes);
router.use('/tenders', tenderRoutes);
router.use('/jobs', jobRoutes);
router.use('/foi-requests', foiRequestRoutes);
router.use('/datasets', datasetRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Ganuwa CMS API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      news: '/api/v1/news',
      leaders: '/api/v1/leaders',
      services: '/api/v1/services',
      projects: '/api/v1/projects',
      mdas: '/api/v1/mdas',
      lgas: '/api/v1/lgas',
      events: '/api/v1/events',
      announcements: '/api/v1/announcements',
      pressReleases: '/api/v1/press-releases',
      media: '/api/v1/media',
      heroBanners: '/api/v1/hero-banners',
      quickLinks: '/api/v1/quick-links',
      contacts: '/api/v1/contacts',
      pages: '/api/v1/pages',
      faqs: '/api/v1/faqs',
      subscribers: '/api/v1/subscribers',
      budgetDocuments: '/api/v1/budget-documents',
      tenders: '/api/v1/tenders',
      jobs: '/api/v1/jobs',
      foiRequests: '/api/v1/foi-requests',
      datasets: '/api/v1/datasets',
    },
    documentation: '/api/v1/docs',
  });
});

module.exports = router;