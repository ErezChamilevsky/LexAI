const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const verifyToken = require('../middleware/auth.middleware');


// Create new chat (Checks limit of 3 internally)
router.post('/', verifyToken, ChatController.createNewChat);

// Get specific chat
router.get('/:id', verifyToken, ChatController.getChatByID);

// Add a message to an existing chat
router.post('/:id/messages', verifyToken, ChatController.addMessageToChat);


module.exports = router;