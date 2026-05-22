// permission.controller.js

const service = require('./permission.service')

/*
|--------------------------------------------------------------------------
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/

exports.getPermissions = async (
    req,
    res
) => {

    try {

        const data = await service.getPermissions()
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
| GET PERMISSION DETAIL
|--------------------------------------------------------------------------
*/

exports.getPermissionDetail = async (
    req,
    res
) => {

    try {

        const data =
            await service.getPermissionDetail(
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
| CREATE PERMISSION
|--------------------------------------------------------------------------
*/

exports.createPermission = async (
    req,
    res
) => {

    try {

        const id =
            await service.createPermission(
                req.body
            )



        res.json({

            success: true,

            message: 'Permission created',

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
| UPDATE PERMISSION
|--------------------------------------------------------------------------
*/

exports.updatePermission = async (
    req,
    res
) => {

    try {

        await service.updatePermission(
            req.params.id,
            req.body
        )



        res.json({

            success: true,

            message: 'Permission updated',

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
