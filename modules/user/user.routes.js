// routes/admin/user.routes.js

const express = require('express')

const router = express.Router()

const controller = require('./user.controller')

const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware')



/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

router.get('/', permissionMiddleware('user.view'), controller.getUsers)
router.get('/:id', permissionMiddleware('user.view'), controller.getUserDetail)
router.post('/', permissionMiddleware('user.create'), controller.createUser)
router.put('/:id', permissionMiddleware('user.update'), controller.updateUser)
router.post('/:id/reset-password', permissionMiddleware('user.update'), controller.resetPassword)
router.post('/:id/toggle-active', permissionMiddleware('user.update'), controller.toggleActive)

/*
|--------------------------------------------------------------------------
| ROLES
|--------------------------------------------------------------------------
*/
router.get('/role', permissionMiddleware('user.view'), controller.getRoles)

/*
|--------------------------------------------------------------------------
| CAMPUSES
|--------------------------------------------------------------------------
*/
router.get('/campus', permissionMiddleware('user.view'), controller.getCampuses)



module.exports = router