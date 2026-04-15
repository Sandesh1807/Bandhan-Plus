const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send/:profileId', protect, sendMessage);
router.get('/history/:profileId', protect, getChatHistory);

module.exports = router;
