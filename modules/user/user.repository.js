// Repository: User SQL

const db = require('../../infrastructure/database/connection');



/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

exports.getUsers = async (
    campus_id,
    filters = {}
) => {

    let sql = `
        SELECT

            u.id,

            u.username,

            u.full_name,

            u.email,

            u.phone,

            u.is_active,

            u.last_login_at,

            u.created_at,

            /*
            |--------------------------------------------------------------------------
            | ROLES
            |--------------------------------------------------------------------------
            */

            COALESCE(

                JSON_AGG(

                    DISTINCT JSONB_BUILD_OBJECT(
                        'id', r.id,
                        'code', r.code,
                        'name', r.name
                    )

                ) FILTER (
                    WHERE r.id IS NOT NULL
                ),

                '[]'

            ) AS roles,

            /*
            |--------------------------------------------------------------------------
            | CAMPUSES
            |--------------------------------------------------------------------------
            */

            COALESCE(

                JSON_AGG(

                    DISTINCT JSONB_BUILD_OBJECT(
                        'id', c.id,
                        'code', c.code,
                        'name', c.name
                    )

                ) FILTER (
                    WHERE c.id IS NOT NULL
                ),

                '[]'

            ) AS campuses

        FROM users u

        LEFT JOIN user_roles ur
            ON ur.user_id = u.id

        LEFT JOIN roles r
            ON r.id = ur.role_id

        LEFT JOIN user_campus_scopes ucs
            ON ucs.user_id = u.id

        LEFT JOIN campuses c
            ON c.id = ucs.campus_id

        WHERE 1 = 1
    `

    const params = []



    /*
    |--------------------------------------------------------------------------
    | KEYWORD
    |--------------------------------------------------------------------------
    */

    if (filters.keyword) {

        params.push(
            `%${filters.keyword}%`
        )

        sql += `
            AND (
                u.username ILIKE $${params.length}
                OR u.full_name ILIKE $${params.length}
                OR u.email ILIKE $${params.length}
                OR u.phone ILIKE $${params.length}
            )
        `

    }



    /*
    |--------------------------------------------------------------------------
    | ACTIVE
    |--------------------------------------------------------------------------
    */

    if (
        filters.is_active !== undefined
        &&
        filters.is_active !== ''
    ) {

        params.push(
            filters.is_active === 'true'
        )

        sql += `
            AND u.is_active = $${params.length}
        `

    }



    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    if (filters.role_id) {

        params.push(filters.role_id)

        sql += `
            AND EXISTS (

                SELECT 1
                FROM user_roles xur

                WHERE xur.user_id = u.id
                    AND xur.role_id = $${params.length}

            )
        `

    }



    /*
    |--------------------------------------------------------------------------
    | CAMPUS
    |--------------------------------------------------------------------------
    */

    if (campus_id) {

        params.push(campus_id)

        sql += `
            AND EXISTS (

                SELECT 1
                FROM user_campus_scopes xucs

                WHERE xucs.user_id = u.id
                    AND xucs.campus_id = $${params.length}

            )
        `

    }



    sql += `

        GROUP BY
            u.id

        ORDER BY
            u.created_at DESC
    `



    const result = await db.query(
        sql,
        params
    )

    return result.rows

}



/*
|--------------------------------------------------------------------------
| GET USER DETAIL
|--------------------------------------------------------------------------
*/

exports.getUserDetail = async (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    const userSql = `
        SELECT

            id,

            username,

            full_name,

            email,

            phone,

            is_active

        FROM users

        WHERE id = $1
    `

    const userResult = await db.query(
        userSql,
        [id]
    )



    const user = userResult.rows[0]



    if (!user) {
        return null
    }



    /*
    |--------------------------------------------------------------------------
    | ROLES
    |--------------------------------------------------------------------------
    */

    const roleSql = `
        SELECT
            role_id
        FROM user_roles
        WHERE user_id = $1
    `

    const roleResult = await db.query(
        roleSql,
        [id]
    )



    /*
    |--------------------------------------------------------------------------
    | CAMPUSES
    |--------------------------------------------------------------------------
    */

    const campusSql = `
        SELECT
            campus_id
        FROM user_campus_scopes
        WHERE user_id = $1
    `

    const campusResult = await db.query(
        campusSql,
        [id]
    )



    user.role_ids =
        roleResult.rows.map(
            item => item.role_id
        )



    user.campus_ids =
        campusResult.rows.map(
            item => item.campus_id
        )



    return user

}



/*
|--------------------------------------------------------------------------
| CHECK USERNAME EXISTS
|--------------------------------------------------------------------------
*/

exports.checkUsernameExists = async (
    username,
    excludeId = null
) => {

    let sql = `
        SELECT id
        FROM users
        WHERE username = $1
    `

    const params = [username]



    if (excludeId) {

        params.push(excludeId)

        sql += `
            AND id != $${params.length}
        `

    }



    const result = await db.query(
        sql,
        params
    )

    return result.rows.length > 0

}



/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

exports.createUser = async (
    client,
    data
) => {

    const sql = `
        INSERT INTO users (

            username,
            password,

            full_name,

            email,
            phone,

            is_active

        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )
        RETURNING id
    `



    const result = await client.query(
        sql,
        [

            data.username,
            data.password,

            data.full_name,

            data.email,
            data.phone,

            data.is_active

        ]
    )



    return result.rows[0].id

}



/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

exports.updateUser = async (
    client,
    id,
    data
) => {

    const sql = `
        UPDATE users
        SET

            full_name = $1,

            email = $2,
            phone = $3,

            is_active = $4,

            updated_at = NOW()

        WHERE id = $5
    `



    await client.query(
        sql,
        [

            data.full_name,

            data.email,
            data.phone,

            data.is_active,

            id

        ]
    )

}



/*
|--------------------------------------------------------------------------
| DELETE USER ROLES
|--------------------------------------------------------------------------
*/

exports.deleteUserRoles = async (
    client,
    user_id
) => {

    await client.query(
        `
            DELETE FROM user_roles
            WHERE user_id = $1
        `,
        [user_id]
    )

}



/*
|--------------------------------------------------------------------------
| INSERT USER ROLE
|--------------------------------------------------------------------------
*/

exports.insertUserRole = async (
    client,
    user_id,
    role_id
) => {

    await client.query(
        `
            INSERT INTO user_roles (
                user_id,
                role_id
            )
            VALUES ($1, $2)
        `,
        [
            user_id,
            role_id
        ]
    )

}



/*
|--------------------------------------------------------------------------
| DELETE USER CAMPUS
|--------------------------------------------------------------------------
*/

exports.deleteUserCampuses = async (
    client,
    user_id
) => {

    await client.query(
        `
            DELETE FROM user_campus_scopes
            WHERE user_id = $1
        `,
        [user_id]
    )

}



/*
|--------------------------------------------------------------------------
| INSERT USER CAMPUS
|--------------------------------------------------------------------------
*/

exports.insertUserCampus = async (
    client,
    user_id,
    campus_id
) => {

    await client.query(
        `
            INSERT INTO user_campus_scopes (
                user_id,
                campus_id
            )
            VALUES ($1, $2)
        `,
        [
            user_id,
            campus_id
        ]
    )

}



/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

exports.resetPassword = async (
    id,
    hashedPassword
) => {

    await db.query(
        `
            UPDATE users
            SET

                password = $1,

                updated_at = NOW()

            WHERE id = $2
        `,
        [
            hashedPassword,
            id
        ]
    )

}



/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE
|--------------------------------------------------------------------------
*/

exports.toggleActive = async (
    id
) => {

    await db.query(
        `
            UPDATE users
            SET

                is_active = NOT is_active,

                updated_at = NOW()

            WHERE id = $1
        `,
        [id]
    )

}



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

exports.getRoles = async () => {

    const result = await db.query(
        `
            SELECT

                id,
                code,
                name

            FROM roles

            ORDER BY name ASC
        `
    )

    return result.rows

}



/*
|--------------------------------------------------------------------------
| GET CAMPUSES
|--------------------------------------------------------------------------
*/

exports.getCampuses = async () => {

    const result = await db.query(
        `
            SELECT

                id,
                code,
                name

            FROM campuses

            ORDER BY name ASC
        `
    )

    return result.rows

}