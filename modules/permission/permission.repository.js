// permission.repository.js

const db = require('../../infrastructure/database/connection')


/*
|--------------------------------------------------------------------------
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/

exports.getPermissions = async () => {

    const sql = `
        SELECT

            id,
            module_key,
            action_key,
            code,
            created_at,
            updated_at

        FROM permissions

        ORDER BY
            module_key ASC,
            action_key ASC
    `



    const result = await db.query(sql)

    return result.rows

}



/*
|--------------------------------------------------------------------------
| GET PERMISSION DETAIL
|--------------------------------------------------------------------------
*/

exports.getPermissionDetail = async (
    id
) => {

    const sql = `
        SELECT

            id,
            module_key,
            action_key,
            code

        FROM permissions

        WHERE id = $1
    `



    const result = await db.query(
        sql,
        [id]
    )



    return result.rows[0] || null

}



/*
|--------------------------------------------------------------------------
| CHECK CODE EXISTS
|--------------------------------------------------------------------------
*/

exports.checkPermissionCodeExists = async (
    code,
    excludeId = null
) => {

    let sql = `
        SELECT id
        FROM permissions
        WHERE code = $1
    `

    const params = [code]



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
| CREATE PERMISSION
|--------------------------------------------------------------------------
*/

exports.createPermission = async (
    data
) => {

    const sql = `
        INSERT INTO permissions (

            module_key,
            action_key,
            code,
            created_at,
            updated_at

        )
        VALUES (
            $1,
            $2,
            $3,
            NOW(),
            NOW()
        )
        RETURNING id
    `



    const result = await db.query(
        sql,
        [
            data.module_key,
            data.action_key,
            data.code
        ]
    )



    return result.rows[0].id

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

    const sql = `
        UPDATE permissions
        SET

            module_key = $1,

            action_key = $2,

            code = $3,

            updated_at = NOW()

        WHERE id = $4
    `



    await db.query(
        sql,
        [
            data.module_key,
            data.action_key,
            data.code,
            id
        ]
    )

}