// role.repository.js

const db = require('../../infrastructure/database/connection')



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

exports.getRoles = async () => {

    const sql = `
        SELECT

            r.id,
            r.code,
            r.name,
            r.description,
            r.is_system,
            r.created_at,
            r.updated_at,

            COUNT(rp.permission_id) AS permission_count

        FROM roles r

        LEFT JOIN role_permissions rp
            ON rp.role_id = r.id

        GROUP BY r.id

        ORDER BY
            r.is_system DESC,
            r.name ASC
    `



    const result = await db.query(sql)

    return result.rows

}



/*
|--------------------------------------------------------------------------
| GET ROLE DETAIL
|--------------------------------------------------------------------------
*/

exports.getRoleDetail = async (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    const roleSql = `
        SELECT

            id,
            code,
            name,
            description,
            is_system

        FROM roles

        WHERE id = $1
    `



    const roleResult = await db.query(
        roleSql,
        [id]
    )



    const role = roleResult.rows[0]



    if (!role) {
        return null
    }



    /*
    |--------------------------------------------------------------------------
    | PERMISSIONS
    |--------------------------------------------------------------------------
    */

    const permissionSql = `
        SELECT
            permission_id
        FROM role_permissions
        WHERE role_id = $1
    `



    const permissionResult =
        await db.query(
            permissionSql,
            [id]
        )



    role.permission_ids =
        permissionResult.rows.map(
            item => item.permission_id
        )



    return role

}



/*
|--------------------------------------------------------------------------
| CHECK ROLE CODE EXISTS
|--------------------------------------------------------------------------
*/

exports.checkRoleCodeExists = async (
    code,
    excludeId = null
) => {

    let sql = `
        SELECT id
        FROM roles
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
| CREATE ROLE
|--------------------------------------------------------------------------
*/

exports.createRole = async (
    client,
    data
) => {

    const sql = `
        INSERT INTO roles (

            code,
            name,
            description,
            is_system,
            created_at,
            updated_at

        )
        VALUES (
            $1,
            $2,
            $3,
            false,
            NOW(),
            NOW()
        )
        RETURNING id
    `



    const result = await client.query(
        sql,
        [
            data.code,
            data.name,
            data.description || null
        ]
    )



    return result.rows[0].id

}



/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

exports.updateRole = async (
    client,
    id,
    data
) => {

    const sql = `
        UPDATE roles
        SET

            name = $1,

            description = $2,

            updated_at = NOW()

        WHERE id = $3
    `



    await client.query(
        sql,
        [
            data.name,
            data.description || null,
            id
        ]
    )

}



/*
|--------------------------------------------------------------------------
| DELETE ROLE PERMISSIONS
|--------------------------------------------------------------------------
*/

exports.deleteRolePermissions = async (
    client,
    roleId
) => {

    await client.query(
        `
            DELETE FROM role_permissions
            WHERE role_id = $1
        `,
        [roleId]
    )

}



/*
|--------------------------------------------------------------------------
| INSERT ROLE PERMISSION
|--------------------------------------------------------------------------
*/

exports.insertRolePermission = async (
    client,
    roleId,
    permissionId
) => {

    await client.query(
        `
            INSERT INTO role_permissions (
                role_id,
                permission_id,
                created_at
            )
            VALUES (
                $1,
                $2,
                NOW()
            )
        `,
        [
            roleId,
            permissionId
        ]
    )

}
// repositories/role.repository.js



/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
|--------------------------------------------------------------------------
*/

exports.updateRolePermissions = async (
    client,
    roleId,
    permissionIds = []
) => {

    /*
    |--------------------------------------------------------------------------
    | DELETE OLD
    |--------------------------------------------------------------------------
    */

    await client.query(
        `
            DELETE FROM role_permissions
            WHERE role_id = $1
        `,
        [roleId]
    )



    /*
    |--------------------------------------------------------------------------
    | INSERT NEW
    |--------------------------------------------------------------------------
    */

    for (
        const permissionId
        of permissionIds
    ) {

        await client.query(
            `
                INSERT INTO role_permissions (
                    role_id,
                    permission_id,
                    created_at
                )
                VALUES (
                    $1,
                    $2,
                    NOW()
                )
            `,
            [
                roleId,
                permissionId
            ]
        )

    }

}
