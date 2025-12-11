const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/google', AuthController.googleLogin);

module.exports = router;