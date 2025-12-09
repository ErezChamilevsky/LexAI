const express = require('express');
const router = express.Router();
const TestController = require('../controllers/test.controller');

// Test Creation
router.post('/writing', TestController.createWritingTest);
router.post('/reading', TestController.createReadingTest);
router.post('/speaking', TestController.createSpeakingTest);
router.post('/placement', TestController.createOverallTest);

// Grading
router.put('/:id/grade', TestController.setGradeByTestID);

module.exports = router;