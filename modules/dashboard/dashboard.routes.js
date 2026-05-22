const express = require('express')
const router = express.Router()

const controller = require('./dashboard.controller')
const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware')

// HEALTH
router.get('/health', permissionMiddleware('inspection.view'), controller.getHealth)

// SUMMARY
router.get('/summary', permissionMiddleware('repair.view'), controller.getSummary)

// MONTHLY TASKS
router.get('/monthly-tasks', permissionMiddleware('periodic.view'), controller.getMonthlyTasks)

// RECENT COMPLETED
router.get('/recent-completed', permissionMiddleware('repair.view'), controller.getRecentCompleted)

// SUMMER WORK
router.get('/summer-work', permissionMiddleware('portal.tech'), controller.getSummerWorkDashboard)

module.exports = router