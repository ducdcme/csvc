// Service: User business logic

const bcrypt = require('bcrypt')

const db = require('../../infrastructure/database/connection');

const repo = require('./user.repository')



/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

exports.getUsers = async (
    campus_id,
    filters
) => {

    return await repo.getUsers(
        campus_id,
        filters
    )

}



/*
|--------------------------------------------------------------------------
| GET USER DETAIL
|--------------------------------------------------------------------------
*/

exports.getUserDetail = async (
    id
) => {

    const user =
        await repo.getUserDetail(id)



    if (!user) {
        throw new Error('User not found')
    }



    return user

}



/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

exports.createUser = async (
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.username) {
        throw new Error('Username is required')
    }



    if (!data.password) {
        throw new Error('Password is required')
    }



    if (!data.full_name) {
        throw new Error('Full name is required')
    }



    if (
        !Array.isArray(data.role_ids)
        ||
        data.role_ids.length === 0
    ) {
        throw new Error(
            'At least 1 role is required'
        )
    }



    if (
        !Array.isArray(data.campus_ids)
        ||
        data.campus_ids.length === 0
    ) {
        throw new Error(
            'At least 1 campus is required'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | CHECK USERNAME
    |--------------------------------------------------------------------------
    */

    const exists =
        await repo.checkUsernameExists(
            data.username
        )



    if (exists) {
        throw new Error(
            'Username already exists'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
        await bcrypt.hash(
            data.password,
            10
        )



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
        | CREATE USER
        |--------------------------------------------------------------------------
        */

        const userId =
            await repo.createUser(
                client,
                {

                    username:
                        data.username,

                    password:
                        hashedPassword,

                    full_name:
                        data.full_name,

                    email:
                        data.email || null,

                    phone:
                        data.phone || null,

                    is_active:
                        data.is_active !== false

                }
            )



        /*
        |--------------------------------------------------------------------------
        | INSERT ROLES
        |--------------------------------------------------------------------------
        */

        for (const roleId of data.role_ids) {

            await repo.insertUserRole(
                client,
                userId,
                roleId
            )

        }



        /*
        |--------------------------------------------------------------------------
        | INSERT CAMPUSES
        |--------------------------------------------------------------------------
        */

        for (const campusId of data.campus_ids) {

            await repo.insertUserCampus(
                client,
                userId,
                campusId
            )

        }



        await client.query('COMMIT')



        return userId

    } catch (err) {

        await client.query('ROLLBACK')

        throw err

    } finally {

        client.release()

    }

}



/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

exports.updateUser = async (req, id, data) => {

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    if (!data.full_name) {
        throw new Error(
            'Full name is required'
        )
    }



    if (
        !Array.isArray(data.role_ids)
        ||
        data.role_ids.length === 0
    ) {
        throw new Error(
            'At least 1 role is required'
        )
    }



    if (
        !Array.isArray(data.campus_ids)
        ||
        data.campus_ids.length === 0
    ) {
        throw new Error(
            'At least 1 campus is required'
        )
    }



    /*
    |--------------------------------------------------------------------------
    | CHECK USER
    |--------------------------------------------------------------------------
    */

    const user =
        await repo.getUserDetail(id)



    if (!user) {
        throw new Error('User not found')
    }

    /*
    |--------------------------------------------------------------------------
    | CANNOT DISABLE SELF
    |--------------------------------------------------------------------------
    */

    if (

        req.user.id == id

        &&

        data.is_active === false

    ) {

        throw new Error(
            'You cannot disable your own account'
        )

    }

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const client = await db.connect()



    try {

        await client.query('BEGIN')



        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        await repo.updateUser(
            client,
            id,
            {

                full_name:
                    data.full_name,

                email:
                    data.email || null,

                phone:
                    data.phone || null,

                is_active:
                    data.is_active !== false

            }
        )



        /*
        |--------------------------------------------------------------------------
        | RESET ROLES
        |--------------------------------------------------------------------------
        */

        await repo.deleteUserRoles(
            client,
            id
        )



        for (const roleId of data.role_ids) {

            await repo.insertUserRole(
                client,
                id,
                roleId
            )

        }



        /*
        |--------------------------------------------------------------------------
        | RESET CAMPUSES
        |--------------------------------------------------------------------------
        */

        await repo.deleteUserCampuses(
            client,
            id
        )



        for (const campusId of data.campus_ids) {

            await repo.insertUserCampus(
                client,
                id,
                campusId
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



/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

exports.resetPassword = async (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | CHECK USER
    |--------------------------------------------------------------------------
    */

    const user =
        await repo.getUserDetail(id)



    if (!user) {
        throw new Error('User not found')
    }



    /*
    |--------------------------------------------------------------------------
    | DEFAULT PASSWORD
    |--------------------------------------------------------------------------
    */

    const defaultPassword =
        '123456'



    /*
    |--------------------------------------------------------------------------
    | HASH
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(defaultPassword, 10)



    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    await repo.resetPassword(id, hashedPassword)

}



/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE
|--------------------------------------------------------------------------
*/

exports.toggleActive = async (userId, id) => {

    /*
    |--------------------------------------------------------------------------
    | CHECK USER
    |--------------------------------------------------------------------------
    */

    const user =
        await repo.getUserDetail(id)



    if (!user) {
        throw new Error('User not found')
    }



    if (userId == id) {
        throw new Error('Cannot toggle active on self')
    }

    await repo.toggleActive(id)

}



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
| GET CAMPUSES
|--------------------------------------------------------------------------
*/

exports.getCampuses = async () => {

    return await repo.getCampuses()

}