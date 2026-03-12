const express = require('express');
const router = express.Router();
const { startSession, sendMessage, getSessions, getSession, chatRateLimiter } = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public endpoints
router.post('/start', chatRateLimiter, startSession);
router.post('/', chatRateLimiter, sendMessage);

// Admin endpoints (requires authentication)
router.get('/sessions', authenticate, getSessions);
router.get('/sessions/:sessionId', authenticate, getSession);

module.exports = router;
