/**
 * Periodic Admin Routes
 */

const express = require('express')

const router = express.Router()

const controller = require('./periodic-admin.controller')

const permissionMiddleware = require('../../../infrastructure/middleware/permission.middleware')



/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

router.get('/types', permissionMiddleware('periodic_work.manage'), controller.getTypes)


/*
|--------------------------------------------------------------------------
| DEFINITIONS
|--------------------------------------------------------------------------
*/

router.get('/definitions', permissionMiddleware('periodic_work.manage'), controller.getDefinitions)

router.get('/definitions/:id', permissionMiddleware('periodic_work.manage'), controller.getDefinitionById)

router.post('/definitions', permissionMiddleware('periodic_work.manage'), controller.createDefinition)

router.put('/definitions/:id', permissionMiddleware('periodic_work.manage'), controller.updateDefinition)

router.delete('/definitions/:id', permissionMiddleware('periodic_work.manage'), controller.deleteDefinition)

router.patch('/definitions/:id/status', permissionMiddleware('periodic_work.manage'), controller.updateDefinitionStatus)

router.get('/jobs', permissionMiddleware('periodic_work.manage'), controller.getJobs)

router.get('/jobs/:id', permissionMiddleware('periodic_work.manage'), controller.getJobDetail)

router.patch('/jobs/:id/status', permissionMiddleware('periodic_work.manage'), controller.updateJobStatus)

router.get('/jobs/:id/detail', permissionMiddleware('periodic_work.manage'), controller.getJobRuntimeDetail)

router.post('/generate', permissionMiddleware('periodic_work.manage'), controller.generateJob)

// Update job business
router.patch('/jobs/:id/business', permissionMiddleware('periodic_work.manage'), controller.updateJobBusinessInfo)

// MANUAL ROOMS ASSIGN / DELETE
router.post('/jobs/:id/rooms', permissionMiddleware('periodic_work.manage'), controller.assignRoomsToJob)
router.delete('/jobs/:jobId/rooms/:roomId', permissionMiddleware('periodic_work.manage'), controller.removeRoomFromJob)

module.exports = router