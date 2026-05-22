const express = require('express');
const router = express.Router();
const controller = require('./contractor.controller');
const auth = require('../../infrastructure/middleware/auth.middleware');

// GET list contractor
router.get('/', auth, controller.getList);

// CREATE contractor (admin dùng)
router.post('/', auth, controller.create);

module.exports = router; 