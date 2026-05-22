// User controller

const service = require('./user.service')



/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

exports.getUsers = async (
    req,
    res
) => {

    try {

        const data =
            await service.getUsers(
                req.campus_id,
                req.query
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
| GET USER DETAIL
|--------------------------------------------------------------------------
*/

exports.getUserDetail = async (
    req,
    res
) => {

    try {

        const data =
            await service.getUserDetail(
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
| CREATE USER
|--------------------------------------------------------------------------
*/

exports.createUser = async (
    req,
    res
) => {

    try {

        const id =
            await service.createUser(
                req.body
            )



        res.json({

            success: true,

            message: 'User created',

            data: {
                id
            },

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
| UPDATE USER
|--------------------------------------------------------------------------
*/

exports.updateUser = async (
    req,
    res
) => {

    try {

        await service.updateUser(req, req.params.id, req.body)



        res.json({

            success: true,

            message: 'User updated',

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



/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

exports.resetPassword = async (
    req,
    res
) => {

    try {

        await service.resetPassword(
            req.params.id
        )



        res.json({

            success: true,

            message: 'Password reset to 123456',

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



/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE
|--------------------------------------------------------------------------
*/

exports.toggleActive = async (
    req,
    res
) => {

    try {

        await service.toggleActive(req.user.id, req.params.id)



        res.json({

            success: true,

            message: 'User status updated',

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
| GET CAMPUSES
|--------------------------------------------------------------------------
*/

exports.getCampuses = async (
    req,
    res
) => {

    try {

        const data =
            await service.getCampuses()



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