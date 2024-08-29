const express = require('express');
const router = express.Router();

const { getChats, getChatMembers, getMessagesByChatId, createThread, sendChat } = require('../../controllers/chatController');

router.post('/list', getChats);
router.post('/new', createThread);
router.post('/send', sendChat);
router.get('/:chatId/members', getChatMembers);
router.get('/:chatId', getMessagesByChatId);

module.exports = router;