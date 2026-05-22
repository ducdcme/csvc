// API: Repair routes

const express = require('express');
const router = express.Router();
const repairController = require('./repair.controller');
const permission = require('../../infrastructure/middleware/permission.middleware');

// ===== LIST + DETAIL =====
router.get('/summary', permission('repair.view'), repairController.getSummary)
router.get('/', permission('repair.view'), repairController.getRepairs);
router.get('/:id', permission('repair.view'), repairController.getRepairDetail);

// ===== TECH WORKFLOW =====
router.post('/:id/receive', permission('repair.receive'), repairController.receiveRepair);
router.post('/:id/start', permission('repair.start'), repairController.startRepair);
router.post('/:id/complete', permission('repair.complete'), repairController.completeRepair);
router.post('/:id/detail', permission('repair.complete'), repairController.updateDetail);
router.post('/create', permission('repair.create'), repairController.createByTech)

// ===== SUPERVISOR OVERRIDE =====
router.put('/:id/update-status', permission('repair.update'), repairController.updateStatus);

module.exports = router;