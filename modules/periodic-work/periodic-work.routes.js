/**
 * API: Periodic Work Routes
 * Theo chuẩn module-based + middleware riêng
 */

const express = require('express');
const router = express.Router();

const controller = require('./periodic-work.controller');
const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware');

// ================= JOBS =================

/**
 * GET /user/periodic-work/jobs?month=YYYY-MM
 * Lấy danh sách job theo tháng
 */
router.get('/jobs', permissionMiddleware('periodic.view'), controller.getJobs);

/**
 * GET /user/periodic-work/jobs/overdue
 * Lấy danh sách job quá hạn
 */
router.get('/jobs/overdue', permissionMiddleware('periodic.view'), controller.getOverdueJobs);

/**
 * GET /user/periodic-work/jobs/:id
 * Chi tiết job
 */
router.get('/jobs/:id', permissionMiddleware('periodic.view'), controller.getJobDetail);


// ================= INSPECTION =================

/**
 * GET /user/periodic-work/jobs/:id/rooms
 * Lấy danh sách room của job (inspection)
 */
router.get('/jobs/:id/rooms', permissionMiddleware('periodic.view'), controller.getJobRooms);

/**
 * POST /user/periodic-work/job-rooms/:id/submit
 * Submit kiểm tra room
 */
router.post('/job-rooms/:id/submit', permissionMiddleware('periodic.submit'), controller.submitJobRoom);


// ================= MAINTENANCE / OPERATION =================

/**
 * PUT /user/periodic-work/jobs/:id/complete
 * Hoàn thành job (maintenance / operation)
 */
router.put('/jobs/:id/complete', permissionMiddleware('periodic.complete'), controller.completeJob);


// ================= OVERDUE ACTION =================

/**
 * PATCH /user/periodic-work/jobs/:id/skip
 * Manager bỏ qua job quá hạn
 */
router.patch('/jobs/:id/skip', permissionMiddleware('periodic.skip'), controller.skipJob);


// ================= DASHBOARD =================

/**
 * GET /user/periodic-work/dashboard
 */
router.get('/dashboard', permissionMiddleware('periodic.view'), controller.getDashboard);
router.get('/monthly', permissionMiddleware('periodic.view'), controller.getMonthly);
/**
 * GET /user/periodic-work/jobs/:id/rooms-tree
 */
router.get('/jobs/:id/rooms-tree', permissionMiddleware('periodic.view'), controller.getJobRoomsTree);

// ================= DEFINITIONS (OPTIONAL - ADMIN) =================

// ===== SUBMIT JOB =====
//router.post('/jobs/:id/rooms', isAuthenticated, checkPermission('periodic.submit'), controller.submitInspection);

router.post('/jobs/:id/submit-operation', permissionMiddleware('periodic.submit'), controller.submitOperation);

router.post('/jobs/:id/submit-maintenance', permissionMiddleware('periodic.submit'), controller.submitMaintenance);

router.post('/jobs/:jobId/rooms/:jobRoomId/done', permissionMiddleware('periodic.submit'), controller.doneJobRoom);
/**
 * GET /user/periodic-work/definitions
 */
//router.get('/definitions',
// isAuthenticated,
// checkPermission('periodic.definition.view'),
// controller.getDefinitions
//);

module.exports = router;