const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

// Create new chat (Checks limit of 3 internally)
router.post('/', ChatController.createNewChat);

// Get specific chat
router.get('/:id', ChatController.getChatByID);

module.exports = router;