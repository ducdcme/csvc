// Auth Routes

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/logout
router.post('/logout', authController.logout);

// POST /auth/change-password
router.post('/change-password', authController.changePassword);

// GET /auth/me
router.get('/me', authController.getMe);

module.exports = router;