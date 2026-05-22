// permission.service.js

const repo = require('./permission.repository')

/*
|--------------------------------------------------------------------------
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/

exports.getPermissions = async () => {

    return await repo.getPermissions()

}



/*
|--------------------------------------------------------------------------
| GET PERMISSION DETAIL
|--------------------------------------------------------------------------
*/

exports.getPermissionDetail = async (
    id
) => {

    const permission =
        await repo.getPermissionDetail(id)



    if (!permission) {
        throw new Error('Permission not found')
    }



    return permission

}



/*
|--------------------------------------------------------------------------
| CREATE PERMISSION
|--------------------------------------------------------------------------
*/

exports.createPermission = async (
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.module_key) {
        throw new Error(
            'Module key is required'
        )
    }



    if (!data.action_key) {
        throw new Error(
            'Action key is required'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | GENERATE CODE
    |--------------------------------------------------------------------------
    */

    const code =
        `${data.module_key}.${data.action_key}`



    /*
    |--------------------------------------------------------------------------
    | CHECK CODE
    |--------------------------------------------------------------------------
    */

    const exists =
        await repo.checkPermissionCodeExists(
            code
        )



    if (exists) {
        throw new Error(
            'Permission already exists'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    return await repo.createPermission({

        module_key:
            data.module_key,

        action_key:
            data.action_key,

        code

    })

}



/*
|--------------------------------------------------------------------------
| UPDATE PERMISSION
|--------------------------------------------------------------------------
*/

exports.updatePermission = async (
    id,
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.module_key) {
        throw new Error(
            'Module key is required'
        )
    }



    if (!data.action_key) {
        throw new Error(
            'Action key is required'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | CHECK PERMISSION
    |--------------------------------------------------------------------------
    */

    const permission =
        await repo.getPermissionDetail(id)



    if (!permission) {
        throw new Error(
            'Permission not found'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | GENERATE CODE
    |--------------------------------------------------------------------------
    */

    const code =
        `${data.module_key}.${data.action_key}`



    /*
    |--------------------------------------------------------------------------
    | CHECK CODE
    |--------------------------------------------------------------------------
    */

    const exists =
        await repo.checkPermissionCodeExists(
            code,
            id
        )



    if (exists) {
        throw new Error(
            'Permission already exists'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    await repo.updatePermission(
        id,
        {
            module_key:
                data.module_key,

            action_key:
                data.action_key,

            code
        }
    )

}
