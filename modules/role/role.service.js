// role.service.js
const db = require('../../infrastructure/database/connection');
const repo = require('./role.repository')



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

exports.getRoles = async () => {

    return await repo.getRoles()

}



/*
|--------------------------------------------------------------------------
| GET ROLE DETAIL
|--------------------------------------------------------------------------
*/

exports.getRoleDetail = async (
    id
) => {

    const role =
        await repo.getRoleDetail(id)



    if (!role) {
        throw new Error('Role not found')
    }



    return role

}



/*
|--------------------------------------------------------------------------
| CREATE ROLE
|--------------------------------------------------------------------------
*/

exports.createRole = async (
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.code) {
        throw new Error('Code is required')
    }



    if (!data.name) {
        throw new Error('Name is required')
    }



    /*
    |--------------------------------------------------------------------------
    | CHECK CODE
    |--------------------------------------------------------------------------
    */

    const exists =
        await repo.checkRoleCodeExists(
            data.code
        )



    if (exists) {
        throw new Error('Role code already exists')
    }



    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const client =
        await db.connect()



    try {

        await client.query('BEGIN')



        const roleId =
            await repo.createRole(
                client,
                data
            )



        /*
        |--------------------------------------------------------------------------
        | INSERT PERMISSIONS
        |--------------------------------------------------------------------------
        */

        if (
            Array.isArray(data.permission_ids)
        ) {

            for (
                const permissionId
                of data.permission_ids
            ) {

                await repo.insertRolePermission(
                    client,
                    roleId,
                    permissionId
                )

            }

        }



        await client.query('COMMIT')



        return roleId

    } catch (err) {

        await client.query('ROLLBACK')

        throw err

    } finally {

        client.release()

    }

}



/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

exports.updateRole = async (
    id,
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.name) {
        throw new Error('Name is required')
    }



    /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

    const role =
        await repo.getRoleDetail(id)



    if (!role) {
        throw new Error('Role not found')
    }



    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const client =
        await db.connect()



    try {

        await client.query('BEGIN')



        /*
        |--------------------------------------------------------------------------
        | UPDATE ROLE
        |--------------------------------------------------------------------------
        */

        await repo.updateRole(
            client,
            id,
            data
        )



        /*
        |--------------------------------------------------------------------------
        | RESET PERMISSIONS
        |--------------------------------------------------------------------------
        */

        await repo.deleteRolePermissions(
            client,
            id
        )



        if (
            Array.isArray(data.permission_ids)
        ) {

            for (
                const permissionId
                of data.permission_ids
            ) {

                await repo.insertRolePermission(
                    client,
                    id,
                    permissionId
                )

            }

        }



        await client.query('COMMIT')

    } catch (err) {

        await client.query('ROLLBACK')

        throw err

    } finally {

        client.release()

    }

}
exports.updateRolePermissions = async (
    roleId,
    permissionIds
) => {

    const role =
        await repo.getRoleDetail(roleId)



    if (!role) {
        throw new Error('Role not found')
    }



    const client =
        await db.connect()



    try {

        await client.query('BEGIN')



        await repo.deleteRolePermissions(
            client,
            roleId
        )



        for (
            const permissionId
            of permissionIds
        ) {

            await repo.insertRolePermission(
                client,
                roleId,
                permissionId
            )

        }



        await client.query('COMMIT')

    } catch (err) {

        await client.query('ROLLBACK')

        throw err

    } finally {

        client.release()

    }

}