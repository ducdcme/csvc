const express = require('express');
const router = express.Router();
const campusController = require('./campus.controller');

// GET /campus
router.get('/', campusController.getCampusList);

// POST /campus/select
router.post('/select', campusController.selectCampus);

// GET /campus/current
router.get('/current', campusController.getCurrentCampus);

module.exports = router;