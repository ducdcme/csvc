const express = require('express');
const router = express.Router();
const multer = require('multer');

const masterDataRoutes = require('../../modules/master-data/master-data.routes');
const userRoutes = require('../../modules/user/user.routes');
const roleRoutes = require('../../modules/role/role.routes');
const campusRoutes = require('../../modules/campus/campus.routes');
const permissionRoutes = require('../../modules/permission/permission.routes');
const importController = require('../../modules/master-data/import/import.controller');
const upload = multer({ dest: 'uploads/tmp/' });
const contractorRoutes = require('../../modules/contractor/contractor.routes');
const authRoutes = require('../../modules/auth/auth.routes');
const uploadAdminController = require('../../infrastructure/upload/upload.admin.controller');
const periodicRoutes = require('../../modules/periodic-work/admin/periodic-admin.routes');
const incidentWorkRoutes = require('../../modules/incident-work/incident-work.routes');

//File  Manager
router.post('/files/:id/rotate', uploadAdminController.rotateImage);
//Auth
router.use('/', authRoutes);

//Incident
router.use('/incident-work', incidentWorkRoutes);

//Contractor
router.use('/contractors', contractorRoutes);

//Periodic Work
router.use('/periodic-work', periodicRoutes);

// Master Data
router.use('/master-data', masterDataRoutes);

// User
router.use('/user', userRoutes);

// Role
router.use('/roles', roleRoutes);

// Permission
router.use('/permissions', permissionRoutes);

// Campus
router.use('/campus', campusRoutes);

// Repair
router.use('/repairs', require('../../modules/repair/repair.routes'));
//Import - Export Master Data
//Location
// Preview
router.post('/import/locations/preview', upload.single('file'), importController.previewImportLocations);

// Import
router.post('/import/locations', upload.single('file'), importController.importLocations);

// Download template
router.get('/import/locations/template', importController.downloadTemplateLocations);

//Room Name by Year
router.post('/import/room-names/preview', upload.single('file'), importController.previewImportRoomNames);
router.post('/import/room-names', upload.single('file'), importController.importRoomNames);
router.get('/import/room-names/template', importController.downloadTemplateRoomNames);

// TEST
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: "Admin API OK",
        data: { user: req.user },
        pagination: null
    });
});

module.exports = router;