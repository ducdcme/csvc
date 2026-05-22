const express = require('express');
const router = express.Router();

// ===== API =====
const publicApi = require('./api/public.api');
const userApi = require('./api/user.api');
const adminApi = require('./api/admin.api');

// ===== PORTAL =====
const guestPortal = require('./portal/guest.routes');
const techPortal = require('./portal/tech.routes');
const adminPortal = require('./portal/admin.routes');
const errPage = require('./portal/error.routes');

// ===== MIDDLEWARE =====
const campusMiddleware = require('../infrastructure/middleware/campus.middleware');
const authMiddleware = require('../infrastructure/middleware/auth.middleware');
const portalPermission = require('../infrastructure/middleware/portalPermission.middleware');

// ==========================
// API ROUTES
// ==========================


// Public API
router.use('/api', campusMiddleware, publicApi);

// User API
router.use('/user', campusMiddleware, authMiddleware, userApi);

// Admin API
router.use('/admin', campusMiddleware, authMiddleware, adminApi);


// ==========================
// PORTAL ROUTES
// ==========================
// Guest portal
router.use('/guest', guestPortal);

// Tech portal
router.use('/tech', campusMiddleware, authMiddleware, techPortal);

// Manager portal
router.use('/manager', campusMiddleware, authMiddleware, portalPermission('portal.manager'), adminPortal);

//Error Page
router.use('/', errPage);
// ==========================
// ROOT
// ==========================

//router.get('/', (req, res) => {
//    res.redirect('/guest/campus');
//}); 11


module.exports = router;