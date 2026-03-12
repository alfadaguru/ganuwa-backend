const express = require('express');
const router = express.Router();
const { sendMessage, chatRateLimiter } = require('../controllers/chat.controller');

// POST /api/v1/chat - Public endpoint, no auth required
router.post('/', chatRateLimiter, sendMessage);

module.exports = router;