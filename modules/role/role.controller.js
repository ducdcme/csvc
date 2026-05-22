// role.controller.js

const service = require('./role.service')

/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

exports.getRoles = async (
    req,
    res
) => {

    try {

        const data =
            await service.getRoles()



        res.json({

            success: true,

            message: 'OK',

            data,

            pagination: null

        })

    } catch (err) {

        console.error(err)



        res.json({

            success: false,

            message: err.message,

            data: null,

            pagination: null

        })

    }

}



/*
|--------------------------------------------------------------------------
| GET ROLE DETAIL
|--------------------------------------------------------------------------
*/

exports.getRoleDetail = async (
    req,
    res
) => {

    try {

        const data =
            await service.getRoleDetail(
                req.params.id
            )



        res.json({

            success: true,

            message: 'OK',

            data,

            pagination: null

        })

    } catch (err) {

        console.error(err)



        res.json({

            success: false,

            message: err.message,

            data: null,

            pagination: null

        })

    }

}



/*
|--------------------------------------------------------------------------
| CREATE ROLE
|--------------------------------------------------------------------------
*/

exports.createRole = async (
    req,
    res
) => {

    try {

        const id =
            await service.createRole(
                req.body
            )



        res.json({

            success: true,

            message: 'Role created',

            data: { id },

            pagination: null

        })

    } catch (err) {

        console.error(err)



        res.json({

            success: false,

            message: err.message,

            data: null,

            pagination: null

        })

    }

}



/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

exports.updateRole = async (
    req,
    res
) => {

    try {

        await service.updateRole(
            req.params.id,
            req.body
        )



        res.json({

            success: true,

            message: 'Role updated',

            data: {},

            pagination: null

        })

    } catch (err) {

        console.error(err)



        res.json({

            success: false,

            message: err.message,

            data: null,

            pagination: null

        })

    }

}
exports.updateRolePermissions = async (
    req,
    res
) => {

    try {

        await service.updateRolePermissions(
            req.params.id,
            req.body.permission_ids || []
        )



        res.json({

            success: true,

            message: 'Permissions updated',

            data: {},

            pagination: null

        })

    } catch (err) {

        console.error(err)



        res.json({

            success: false,

            message: err.message,

            data: null,

            pagination: null

        })

    }

}
