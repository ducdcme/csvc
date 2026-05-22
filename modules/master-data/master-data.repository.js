// Repository: Master Data SQL
const db = require('../../infrastructure/database/connection');

// Campus
exports.getCampuses = async () => {
    const rs = await db.query(`SELECT id, code, name FROM campuses ORDER BY name`);
    return rs.rows;
};

exports.createCampus = async (data) => {
    const rs = await db.query(
        `INSERT INTO campuses (code, name, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
        [data.code, data.name]
    );
    return rs.rows[0].id;
};

exports.updateCampus = async (id, data) => {
    await db.query(
        `UPDATE campuses SET code=$1, name=$2, updated_at=NOW() WHERE id=$3`,
        [data.code, data.name, id]
    );
};

exports.deleteCampus = async (id) => {
    await db.query(`UPDATE campuses SET status='inactive' WHERE id=$1`, [id]);
};


//--------------------------------------------------------------------------
// BUILDING
//--------------------------------------------------------------------------


exports.getBuildings = async (campus_id) => {

    const sql = `
        SELECT
            id,
            campus_id,
            code,
            name,
            description,
            sort_order,
            is_active,
            created_at,
            updated_at
        FROM buildings
        WHERE campus_id = $1
        ORDER BY sort_order ASC, code ASC
    `

    const result = await db.query(sql, [campus_id])

    return result.rows

}

exports.getBuildingDetail = async (campus_id, id) => {

    const sql = `
        SELECT *
        FROM buildings
        WHERE id = $1
            AND campus_id = $2
    `

    const result = await db.query(sql, [id, campus_id])

    return result.rows[0] || null

}

exports.createBuilding = async (campus_id, data) => {

    const sql = `
        INSERT INTO buildings (
            campus_id,
            code,
            name,
            description,
            sort_order
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `

    const result = await db.query(sql, [
        campus_id,
        data.code,
        data.name,
        data.description || null,
        data.sort_order || 0
    ])

    return result.rows[0].id

}

exports.updateBuilding = async (campus_id, id, data) => {
    await db.query(
        `UPDATE buildings SET 
            code=$1, 
            name=$2, 
            description=$3, 
            sort_order=$4, 
            is_active = $5,
            updated_at=NOW()
        WHERE id=$6 AND campus_id=$7`,
        [
            data.code,
            data.name,
            data.description || null,
            data.sort_order || 0,
            data.is_active || true,
            id,
            campus_id
        ]
    );
};

exports.deleteBuilding = async (campus_id, id) => {
    await db.query(`DELETE FROM buildings WHERE id=$1 AND campus_id=$2`, [id, campus_id]);
};
exports.countFloorByBuilding = async (
    campus_id,
    building_id
) => {

    const sql = `
        SELECT COUNT(*)::int AS total
        FROM floors f
        INNER JOIN buildings b
            ON b.id = f.building_id
        WHERE f.building_id = $1
            AND b.campus_id = $2
    `

    const result = await db.query(sql, [
        building_id,
        campus_id
    ])

    return result.rows[0].total

}

// Floor
exports.getFloors = async (campus_id, building_id) => {

    const sql = `
        SELECT
            f.id,
            f.building_id,

            b.code AS building_code,
            b.name AS building_name,

            f.code,
            f.name,
            f.sort_order,

            f.created_at,
            f.updated_at

        FROM floors f

        INNER JOIN buildings b
            ON b.id = f.building_id

        WHERE f.building_id = $1
            AND b.campus_id = $2

        ORDER BY
            f.sort_order ASC,
            f.code ASC
    `

    const result = await db.query(sql, [
        building_id,
        campus_id
    ])

    return result.rows

}
exports.getFloorDetail = async (campus_id, id) => {

    const sql = `
        SELECT
            f.*,
            b.name AS building_name
        FROM floors f

        INNER JOIN buildings b
            ON b.id = f.building_id

        WHERE f.id = $1
            AND b.campus_id = $2
    `

    const result = await db.query(sql, [id, campus_id])

    return result.rows[0] || null

}
exports.createFloor = async (campus_id, data) => {

    const sql = `
        INSERT INTO floors (
            building_id,
            code,
            name,
            sort_order
        )
        SELECT
            $1,
            $2,
            $3,
            $4
        FROM buildings
        WHERE id = $5
            AND campus_id = $6
        RETURNING id
    `

    const result = await db.query(sql, [
        data.building_id,
        data.code,
        data.name,
        data.sort_order || 0,
        data.building_id,
        campus_id
    ])

    return result.rows[0].id

}


exports.updateFloor = async (campus_id, id, data) => {

    const sql = `
        UPDATE floors f
        SET
            building_id = $1,
            code = $2,
            name = $3,
            sort_order = $4,
            updated_at = NOW()

        FROM buildings b

        WHERE f.id = $5
            AND b.id = f.building_id
            AND b.campus_id = $6
    `

    await db.query(sql, [
        data.building_id,
        data.code,
        data.name,
        data.sort_order || 0,
        id,
        campus_id
    ])

}

exports.deleteFloor = async (campus_id, id) => {

    const sql = `
        DELETE FROM floors f
        USING buildings b
        WHERE f.id = $1
            AND b.id = f.building_id
            AND b.campus_id = $2
    `

    await db.query(sql, [
        id,
        campus_id
    ])

}
exports.countRoomByFloor = async (
    campus_id,
    floor_id
) => {

    const sql = `
        SELECT COUNT(*)::int AS total

        FROM rooms r

        INNER JOIN buildings b
            ON b.id = r.building_id

        WHERE r.floor_id = $1
            AND b.campus_id = $2
    `

    const result = await db.query(sql, [
        floor_id,
        campus_id
    ])

    return result.rows[0].total

}

// Room
exports.getRooms = async (
    campus_id,
    filters
) => {

    let sql = `
        SELECT
            r.id,

            r.campus_id,

            r.building_id,
            b.code AS building_code,
            b.name AS building_name,

            r.floor_id,
            f.code AS floor_code,
            f.name AS floor_name,

            r.room_type_id,
            rt.name AS room_type_name,

            r.code,
            r.name,

            COALESCE(
                rny.room_name,
                r.name
            ) AS current_room_name,

            r.created_at,
            r.updated_at

        FROM rooms r

        INNER JOIN buildings b
            ON b.id = r.building_id

        INNER JOIN floors f
            ON f.id = r.floor_id

        LEFT JOIN room_types rt
            ON rt.id = r.room_type_id

        LEFT JOIN room_names_by_year rny
            ON rny.room_id = r.id
            AND rny.academic_year = $2

        WHERE r.campus_id = $1
    `

    const params = [
        campus_id,
        filters.academic_year || '2025-2026'
    ]



    /*
    |--------------------------------------------------------------------------
    | FLOOR
    |--------------------------------------------------------------------------
    */

    if (filters.floor_id) {

        params.push(filters.floor_id)

        sql += `
            AND r.floor_id = $${params.length}
        `

    }



    /*
    |--------------------------------------------------------------------------
    | BUILDING
    |--------------------------------------------------------------------------
    */

    if (filters.building_id) {

        params.push(filters.building_id)

        sql += `
            AND r.building_id = $${params.length}
        `

    }



    /*
    |--------------------------------------------------------------------------
    | ROOM TYPE
    |--------------------------------------------------------------------------
    */

    if (filters.room_type_id) {

        params.push(filters.room_type_id)

        sql += `
            AND r.room_type_id = $${params.length}
        `

    }



    /*
    |--------------------------------------------------------------------------
    | KEYWORD
    |--------------------------------------------------------------------------
    */

    if (filters.keyword) {

        params.push(`%${filters.keyword}%`)

        sql += `
            AND (
                r.code ILIKE $${params.length}
                OR r.name ILIKE $${params.length}
                OR rny.room_name ILIKE $${params.length}
            )
        `

    }



    sql += `
        ORDER BY
            b.sort_order ASC,
            f.sort_order ASC,
            r.code ASC
    `

    const result = await db.query(
        sql,
        params
    )

    return result.rows

}
exports.getRoomDetail = async (campus_id, id) => {

    const sql = `
        SELECT
            r.*,

            b.name AS building_name,
            f.name AS floor_name,
            rt.name AS room_type_name

        FROM rooms r

        INNER JOIN buildings b
            ON b.id = r.building_id

        INNER JOIN floors f
            ON f.id = r.floor_id

        LEFT JOIN room_types rt
            ON rt.id = r.room_type_id

        WHERE r.id = $1
            AND r.campus_id = $2
    `

    const result = await db.query(sql, [
        id,
        campus_id
    ])

    return result.rows[0] || null

}
exports.createRoom = async (campus_id, data) => {

    const sql = `
        INSERT INTO rooms (
            campus_id,
            building_id,
            floor_id,
            room_type_id,
            code,
            name
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `

    const result = await db.query(sql, [
        campus_id,
        data.building_id,
        data.floor_id,
        data.room_type_id || null,
        data.code,
        data.name || null
    ])

    return result.rows[0].id

}



exports.updateRoom = async (campus_id, id, data) => {

    const sql = `
        UPDATE rooms
        SET
            building_id = $1,
            floor_id = $2,
            room_type_id = $3,
            code = $4,
            name = $5,
            updated_at = NOW()
        WHERE id = $6
            AND campus_id = $7
    `

    await db.query(sql, [
        data.building_id,
        data.floor_id,
        data.room_type_id || null,
        data.code,
        data.name || null,
        id,
        campus_id
    ])

}



exports.deleteRoom = async (campus_id, id) => {

    const sql = `
        DELETE FROM rooms
        WHERE id = $1
            AND campus_id = $2
    `

    await db.query(sql, [
        id,
        campus_id
    ])

}
/*
|--------------------------------------------------------------------------
| CHECK ROOM IN USE
|--------------------------------------------------------------------------
*/

exports.checkRoomInUse = async (
    campus_id,
    room_id
) => {

    /*
    |--------------------------------------------------------------------------
    | REPAIR
    |--------------------------------------------------------------------------
    */

    const repairSql = `
        SELECT 1
        FROM repair_reports
        WHERE campus_id = $1
            AND room_id = $2
        LIMIT 1
    `

    const repairResult = await db.query(
        repairSql,
        [campus_id, room_id]
    )

    if (repairResult.rowCount > 0) {
        return true
    }



    /*
    |--------------------------------------------------------------------------
    | INSPECTION
    |--------------------------------------------------------------------------
    */

    /*
    TODO:
    add inspection room relation later
    */



    /*
    |--------------------------------------------------------------------------
    | PERIODIC WORK
    |--------------------------------------------------------------------------
    */

    const periodicSql = `
        SELECT 1
        FROM periodic_job_rooms
        WHERE room_id = $1
        LIMIT 1
    `

    const periodicResult = await db.query(
        periodicSql,
        [room_id]
    )

    if (periodicResult.rowCount > 0) {
        return true
    }



    /*
    |--------------------------------------------------------------------------
    | INCIDENT WORK
    |--------------------------------------------------------------------------
    */

    /*
    TODO:
    add incident room relation later
    */



    return false

}
/*
|--------------------------------------------------------------------------
| ASSET TYPE
|--------------------------------------------------------------------------
*/

exports.getAssets = async (
    campus_id
) => {

    const sql = `
        SELECT
            id,
            code,
            name,
            group_name
        FROM asset_types
        ORDER BY code ASC
    `

    const result = await db.query(sql)

    return result.rows

}
exports.getAssetDetail = async (id) => {

    const sql = `
        SELECT *
        FROM asset_types
        WHERE id = $1
    `

    const result = await db.query(sql, [id])

    return result.rows[0] || null

}
exports.createAsset = async (campus_id, data) => {

    const sql = `
        INSERT INTO asset_types (
            code,
            name,
            group_name
        )
        VALUES ($1, $2, $3)
        RETURNING id
    `

    const result = await db.query(sql, [
        data.code,
        data.name,
        data.group_name || null
    ])

    return result.rows[0].id

}

exports.updateAsset = async (campus_id, id, data) => {

    const sql = `
        UPDATE asset_types
        SET
            code = $1,
            name = $2,
            group_name = $3
        WHERE id = $4
    `

    await db.query(sql, [
        data.code,
        data.name,
        data.group_name || null,
        id
    ])

}

exports.deleteAsset = async (campus_id, id) => {

    const sql = `
        DELETE FROM asset_types
        WHERE id = $1
    `

    await db.query(sql, [id])

}

exports.countRoomTypeAssetByAsset = async (campus_id, asset_type_id) => {

    const sql = `
        SELECT COUNT(*)::int AS total
        FROM room_type_asset_types
        WHERE asset_type_id = $1
    `

    const result = await db.query(sql, [
        asset_type_id
    ])

    return result.rows[0].total

}
/*
|--------------------------------------------------------------------------
| ROOM TYPE
|--------------------------------------------------------------------------
*/

exports.getRoomTypes = async (campus_id) => {

    const sql = `
        SELECT
            id,
            code,
            name
        FROM room_types
        ORDER BY code ASC
    `

    const result = await db.query(sql)

    return result.rows

}
exports.getRoomTypeDetail = async (id) => {

    const sql = `
        SELECT *
        FROM room_types
        WHERE id = $1
    `

    const result = await db.query(sql, [id])

    return result.rows[0] || null

}

exports.createRoomType = async (campus_id, data) => {

    const sql = `
        INSERT INTO room_types (
            code,
            name
        )
        VALUES ($1, $2)
        RETURNING id
    `

    const result = await db.query(sql, [
        data.code,
        data.name
    ])

    return result.rows[0].id

}



exports.updateRoomType = async (campus_id, id, data) => {

    const sql = `
        UPDATE room_types
        SET
            code = $1,
            name = $2
        WHERE id = $3
    `

    await db.query(sql, [
        data.code,
        data.name,
        id
    ])

}



exports.deleteRoomType = async (campus_id, id) => {

    const sql = `
        DELETE FROM room_types
        WHERE id = $1
    `

    await db.query(sql, [id])

}


exports.countRoomByRoomType = async (campus_id, room_type_id) => {

    const sql = `
        SELECT COUNT(*)::int AS total
        FROM rooms
        WHERE campus_id = $1
            AND room_type_id = $2
    `

    const result = await db.query(sql, [
        campus_id,
        room_type_id
    ])

    return result.rows[0].total

}
/*
|--------------------------------------------------------------------------
| ROOM TYPE ASSET
|--------------------------------------------------------------------------
*/

exports.getRoomTypeAssets = async (
    room_type_id
) => {

    const sql = `
        SELECT
            at.id,
            at.code,
            at.name,
            at.group_name,

            CASE
                WHEN rta.id IS NOT NULL
                THEN true
                ELSE false
            END AS checked

        FROM asset_types at

        LEFT JOIN room_type_asset_types rta
            ON rta.asset_type_id = at.id
            AND rta.room_type_id = $1

        ORDER BY
            at.group_name ASC,
            at.name ASC
    `

    const result = await db.query(
        sql,
        [room_type_id]
    )

    return result.rows

}


exports.addRoomTypeAsset = async (campus_id, data) => {

    const sql = `
        INSERT INTO room_type_asset_types (
            room_type_id,
            asset_type_id
        )
        VALUES ($1, $2)
        ON CONFLICT (
            room_type_id,
            asset_type_id
        )
        DO NOTHING
    `

    await db.query(sql, [
        data.room_type_id,
        data.asset_type_id
    ])

}



exports.removeRoomTypeAsset = async (campus_id, data) => {

    const sql = `
        DELETE FROM room_type_asset_types
        WHERE room_type_id = $1
            AND asset_type_id = $2
    `

    await db.query(sql, [
        data.room_type_id,
        data.asset_type_id
    ])

}
// Get asset types
exports.getAssetTypes = async (campus_id) => {
    const rs = await db.query(`
    SELECT id, code, name
    FROM asset_types
    WHERE campus_id = $1
    ORDER BY name
  `, [campus_id]);

    return rs.rows;
};

// Create asset type
exports.createAssetType = async (campus_id, data) => {
    const rs = await db.query(`
    INSERT INTO asset_types (campus_id, code, name, created_at, updated_at)
    VALUES ($1,$2,$3,NOW(),NOW())
    RETURNING id
  `, [campus_id, data.code, data.name]);

    return rs.rows[0].id;
};
/*
|--------------------------------------------------------------------------
| GET ROOM NAMES
|--------------------------------------------------------------------------
*/

exports.getRoomNames = async (
    campus_id,
    query
) => {

    const academicYear =
        query.academic_year || '2025-2026'



    let sql = `
        SELECT

            r.id AS room_id,

            r.code AS room_code,

            b.name AS building_name,

            f.name AS floor_name,

            /*
            |--------------------------------------------------------------------------
            | ROOM NAME
            |--------------------------------------------------------------------------
            */

            COALESCE(
                rny.room_name,
                r.name,
                ''
            ) AS room_name,

            rny.id AS room_name_id,

            rny.academic_year

        FROM rooms r

        INNER JOIN buildings b
            ON b.id = r.building_id

        INNER JOIN floors f
            ON f.id = r.floor_id

        LEFT JOIN room_names_by_year rny
            ON rny.room_id = r.id
            AND rny.academic_year = $2

        WHERE r.campus_id = $1
    `

    const params = [
        campus_id,
        academicYear
    ]



    /*
    |--------------------------------------------------------------------------
    | BUILDING
    |--------------------------------------------------------------------------
    */

    if (query.building_id) {

        params.push(query.building_id)

        sql += `
            AND r.building_id = $${params.length}
        `

    }



    /*
    |--------------------------------------------------------------------------
    | FLOOR
    |--------------------------------------------------------------------------
    */

    if (query.floor_id) {

        params.push(query.floor_id)

        sql += `
            AND r.floor_id = $${params.length}
        `

    }



    sql += `
        ORDER BY
            b.sort_order ASC,
            f.sort_order ASC,
            r.code ASC
    `



    const result = await db.query(
        sql,
        params
    )

    return result.rows

}



/*
|--------------------------------------------------------------------------
| UPSERT ROOM NAME
|--------------------------------------------------------------------------
*/

exports.upsertRoomName = async (
    campus_id,
    data
) => {

    /*
    |--------------------------------------------------------------------------
    | LOAD ROOM
    |--------------------------------------------------------------------------
    */

    const roomSql = `
        SELECT
            id,
            building_id,
            code
        FROM rooms
        WHERE id = $1
            AND campus_id = $2
    `

    const roomResult = await db.query(
        roomSql,
        [
            data.room_id,
            campus_id
        ]
    )



    const room = roomResult.rows[0]



    if (!room) {
        throw new Error('Room not found')
    }



    /*
    |--------------------------------------------------------------------------
    | UPSERT
    |--------------------------------------------------------------------------
    */

    const sql = `
        INSERT INTO room_names_by_year (

            campus_id,
            building_id,

            room_code,

            academic_year,

            room_name,

            room_id

        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
        )

        ON CONFLICT (
            campus_id,
            building_id,
            room_code,
            academic_year
        )

        DO UPDATE SET

            room_name = EXCLUDED.room_name,

            room_id = EXCLUDED.room_id
    `



    await db.query(sql, [

        campus_id,

        room.building_id,

        room.code,

        data.academic_year,

        data.room_name,

        room.id

    ])

}
// Insert Room Name
exports.insertRoomName = async (
    campus_id,
    building_id,
    room_code,
    academic_year,
    room_name
) => {
    await db.query(`
    INSERT INTO room_names_by_year
    (campus_id, building_id, room_code, academic_year, room_name)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (campus_id, building_id, room_code, academic_year)
    DO UPDATE SET room_name = EXCLUDED.room_name
  `, [campus_id, building_id, room_code, academic_year, room_name]);
};

// Public Location 
// Get location flat data
/**
 * PUBLIC - Get Location Tree (Building → Floor → Room)
 */
/**
 * PUBLIC - Get Location Tree
 * room_name = name theo năm học nếu có, nếu không lấy rooms.name
 */
exports.getLocationTree = async (campus_id, academic_year) => {
    const rs = await db.query(`
    SELECT 
        b.id AS building_id,
        b.code AS building_code,
        b.name AS building_name,
        f.id AS floor_id,
        f.code AS floor_code,
        f.name AS floor_name,
        r.id AS room_id,
        r.code AS room_code,
        COALESCE(rny.room_name, r.name) AS room_name
    FROM buildings b
    LEFT JOIN floors f ON f.building_id = b.id
    LEFT JOIN rooms r ON r.floor_id = f.id
    LEFT JOIN room_names_by_year rny
           ON rny.campus_id = b.campus_id
          AND rny.building_id = b.id
          AND rny.room_code = r.code
          AND rny.academic_year = $2
    WHERE b.campus_id = $1
    ORDER BY b.code, f.sort_order, r.code
  `, [campus_id, academic_year]);

    return rs.rows;
};

// Public Asset Types by Room
exports.getAssetsByRoomPublic = async (campus_id, room_id) => {
    const rs = await db.query(`
    SELECT at.id, at.code, at.name
    FROM rooms r
    JOIN floors f ON r.floor_id = f.id
    JOIN buildings b ON f.building_id = b.id
    JOIN room_types rt ON r.room_type_id = rt.id
    JOIN room_type_asset_types rtat ON rtat.room_type_id = rt.id
    JOIN asset_types at ON at.id = rtat.asset_type_id
    WHERE b.campus_id = $1
      AND r.id = $2
    ORDER BY at.name
  `, [campus_id, room_id]);

    return rs.rows;
};