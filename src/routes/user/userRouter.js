// routes/index.js
const express = require('express');
const router = express.Router();
const { getUser, createUser, updateUser, getSessionUser } = require('../../controllers/userController');

// Define route to create a new user
router.post('/create-user', createUser);

// Define route to update an existing user
router.post('/update-user', updateUser);

// Define route to get user details
router.get('/get-user/:id', getUser);
router.get('/session', getSessionUser);

module.exports = router;
