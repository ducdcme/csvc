// permission.routes.js

const express = require('express')

const router = express.Router()

const controller = require('./permission.controller')

const permissionMiddleware = require('../../infrastructure/middleware/permission.middleware')


/*
|--------------------------------------------------------------------------
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/

router.get('/', permissionMiddleware('user.manage'), controller.getPermissions)



/*
|--------------------------------------------------------------------------
| GET PERMISSION DETAIL
|--------------------------------------------------------------------------
*/

router.get('/:id', permissionMiddleware('user.manage'), controller.getPermissionDetail)



/*
|--------------------------------------------------------------------------
| CREATE PERMISSION
|--------------------------------------------------------------------------
*/

router.post('/', permissionMiddleware('user.manage'), controller.createPermission)



/*
|--------------------------------------------------------------------------
| UPDATE PERMISSION
|--------------------------------------------------------------------------
*/

router.put('/:id', permissionMiddleware('user.manage'), controller.updatePermission)


module.exports = router