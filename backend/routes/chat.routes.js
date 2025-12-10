const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

// Create new chat (Checks limit of 3 internally)
router.post('/', ChatController.createNewChat);

// Get specific chat
router.get('/:id', ChatController.getChatByID);

// Add a message to an existing chat
router.post('/:id/messages', ChatController.addMessageToChat);


module.exports = router;