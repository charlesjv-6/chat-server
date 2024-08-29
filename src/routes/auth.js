const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Login route
router.post('/login', auth);

module.exports = router;
