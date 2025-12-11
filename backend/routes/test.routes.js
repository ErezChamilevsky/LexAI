const express = require('express');
const router = express.Router();
const TestController = require('../controllers/test.controller');
const verifyToken = require('../middleware/auth.middleware');

// Test Creation
router.post('/writing', verifyToken, TestController.createWritingTest);   
router.post('/reading', verifyToken, TestController.createReadingTest);   
router.post('/speaking', verifyToken, TestController.createSpeakingTest); 
router.post('/placement', verifyToken, TestController.createOverallTest); 

// Grading
router.put('/:id/grade', verifyToken, TestController.setGradeByTestID);

module.exports = router;