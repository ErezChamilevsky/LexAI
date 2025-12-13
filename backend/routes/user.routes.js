const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');

router.post('/', UserController.createUser);

router.use(verifyToken);

// CRUD & Basics
router.get('/:email', UserController.getUserByEmail);
router.delete('/:id', UserController.deleteUser);

// Language Management
router.post('/:id/languages', UserController.addLanguageToUser); // Add new language
router.delete('/:id/languages/:code', UserController.deleteLanguage); // Delete language
router.put('/:id/languages/level', UserController.updateLanguageLevel); // Update skill/overall level
router.put('/:id/languages/corrections', UserController.updateCorrections); // Toggle corrections

// Chat Management (User specific)
router.delete('/:id/chats/:chatId', UserController.deleteChatOfUser);

// Premium
router.put('/:id/premium', UserController.updatePremium);

// Test unlock when abonded
router.put('/:id/unlock-test', verifyToken, UserController.unlockTestSession);

module.exports = router;


//#TODO need to add chat to user.
// #TODO need to had tests to user 