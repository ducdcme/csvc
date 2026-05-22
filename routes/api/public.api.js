const express = require('express');
const router = express.Router();

const campusRoutes = require('../../modules/campus/campus.routes');
const authRoutes = require('../../modules/auth/auth.routes');

const masterDataController = require('../../modules/master-data/master-data.controller');
const repairController = require('../../modules/repair/repair.controller');
const fileController = require('../../infrastructure/upload/file.controller');
const { uploadSingle, compressImage } = require('../../infrastructure/upload/upload.middleware');

router.post('/files/upload', uploadSingle, compressImage, fileController.uploadFile);
// FILE
router.get('/files/:id', fileController.getFile);

// CAMPUS
router.use('/campus', campusRoutes);
//AUTH
router.use('/auth', authRoutes);

// MASTER DATA
router.get('/location', masterDataController.getLocationPublic);
router.get('/rooms/:room_id/assets', masterDataController.getAssetsByRoomPublic);

// REPAIR
router.post('/repairs', repairController.createGuestRepair);
router.get('/repairs/completed-recent', repairController.getRecentCompletedRepairs);

// TEST
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "Public API OK",
        data: null,
        pagination: null
    });
});

module.exports = router;