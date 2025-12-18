const express = require('express');
const router = express.Router();
const TestController = require('../controllers/test.controller');
const verifyToken = require('../middleware/auth.middleware');

router.use(verifyToken);

// Test Creation
router.post('/writing', TestController.createWritingTest);
router.post('/reading', TestController.createReadingTest);
router.post('/speaking', TestController.createSpeakingTest);
router.post('/placement', TestController.createOverallTest);

// Grading
router.post('/:testId/submit', verifyToken, TestController.submitTest);

module.exports = router;