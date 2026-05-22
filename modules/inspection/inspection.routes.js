const express = require('express');
const router = express.Router();

const inspectionController = require('./inspection.controller');
const authMiddleware = require('../../infrastructure/middleware/auth.middleware');
const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware');
const { uploadSingle, compressImage } = require('../../infrastructure/upload/upload.middleware');
const fileController = require('../../infrastructure/upload/file.controller');


// All inspection APIs require login
router.use(authMiddleware);

// 1. Get checklist by zone
router.get('/checklist', permissionMiddleware('inspection.create'), inspectionController.getChecklistByZone);

// 3. Get inspection detail
router.get('/detail/:id', permissionMiddleware('inspection.view'), inspectionController.getInspectionDetail);

// 4. Save inspection result
router.post('/result', permissionMiddleware('inspection.update'), inspectionController.saveInspectionResult);

// 5. Upload attachment
router.post('/attachment', uploadSingle, compressImage, permissionMiddleware('inspection.update'), inspectionController.uploadAttachment);

// 6. Submit inspection
router.post('/submit', permissionMiddleware('inspection.submit'), inspectionController.submitInspection);

// 8. Monthly report
router.get('/report/monthly', permissionMiddleware('inspection.report'), inspectionController.getMonthlyReport);

// 9. Fault detail
router.get('/fault/:inspection_id', permissionMiddleware('inspection.view'), inspectionController.getFaultDetail);
// Zones
router.get('/zones', inspectionController.getZones);

// History
router.get('/history', inspectionController.getHistory);

// Zones status today
router.get('/zones-status-today', inspectionController.getZonesStatusToday);

// Dashboard summary
router.get('/dashboard-summary', inspectionController.getDashboardSummary);


router.get('/validate/:id', inspectionController.validateInspection);
//Get File by Result id
router.get('/files/by-result/:result_id', inspectionController.getFilesByResult);

//Overdue
router.get('/today', permissionMiddleware('inspection.view'), inspectionController.getTodayInspections);
router.get('/completed', permissionMiddleware('inspection.view'), inspectionController.getRecentCompleted);
router.post('/attach-file', permissionMiddleware('inspection.update'), inspectionController.attachFile);
router.post('/save-item', permissionMiddleware('inspection.update'), inspectionController.saveItem);
router.post('/upload-temp', uploadSingle, compressImage, fileController.uploadTempInspection);
router.get('/by-date', permissionMiddleware('inspection.view'), inspectionController.getInspectionByDate);
router.post('/create', permissionMiddleware('inspection.create'), inspectionController.createInspection);
router.get('/overdue', permissionMiddleware('inspection.view'), inspectionController.getOverdue);
//Reopen inspection
router.post('/reopen/:id', permissionMiddleware('inspection.update'), inspectionController.reopen);

module.exports = router; 