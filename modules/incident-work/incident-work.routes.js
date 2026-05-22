// API: Incident Work Routes (User)

const express = require('express');
const router = express.Router();
const controller = require('./incident-work.controller');
const permission = require('../../infrastructure/middleware/permission.middleware');

// ===== INCIDENT =====
router.post('/create', permission('incident.create'), controller.create);
router.post('/createIncident', permission('incident.create'), controller.createIncident);
router.get('/', permission('incident.view'), controller.getList);
router.get('/:id', permission('incident.view'), controller.getDetail);
router.put('/:id/updateIncident', permission('incident.update'), controller.updateIncident);

// ===== WORKFLOW =====
router.put('/:id/approve', permission('incident.approve'), controller.approveInternal);
router.put('/:id/start-contracting', permission('incident.update'), controller.startContracting);
router.put('/:id/select-contractor', permission('incident.update'), controller.selectContractor);
router.put('/:id/start', permission('incident.execute'), controller.startWork);
router.put('/:id/close', permission('incident.approve'), controller.closeIncident);



// ===== CHECKLIST =====
router.post('/checklist/:itemId/complete', permission('incident.execute'), controller.completeItem);
router.post('/:id/checklist', permission('incident.update'), controller.createChecklist);
router.put('/checklist/item/:itemId', permission('incident.update'), controller.updateChecklistItem);
router.delete('/checklist/item/:itemId', permission('incident.update'), controller.deleteChecklistItem);

module.exports = router;