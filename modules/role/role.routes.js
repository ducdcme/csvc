// routes/admin/role.routes.js

const express = require('express')

const router = express.Router()

const controller = require('./role.controller')

const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware');


/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

router.get('/', permissionMiddleware('user.manage'), controller.getRoles)

router.post('/', permissionMiddleware('user.manage'), controller.createRole)

router.put('/:id', permissionMiddleware('user.manage'), controller.updateRole)
router.post('/:id/permissions', permissionMiddleware('user.manage'), controller.updateRolePermissions)

/*
|--------------------------------------------------------------------------
| GET ROLE DETAIL
|--------------------------------------------------------------------------
*/

router.get('/:id', permissionMiddleware('user.manage'), controller.getRoleDetail)



module.exports = router