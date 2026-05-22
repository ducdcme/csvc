/**
 * Repository
 * ONLY query DB
 */

const db = require('../../../infrastructure/database/connection')

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

exports.getTypes = async () => {

    const sql = `
        SELECT
            id,
            code,
            name
        FROM periodic_work_types
        ORDER BY name
    `

    return db.query(sql)

}



/*
|--------------------------------------------------------------------------
| DEFINITIONS
|--------------------------------------------------------------------------
*/

exports.getDefinitions = async ({
    campusId,
    typeId,
    status,
    keyword
}) => {

    const conditions = [
        'd.campus_id = $1'
    ]

    const values = [campusId]

    let index = 2

    if (typeId) {

        conditions.push(`
            d.periodic_work_type_id = $${index}
        `)

        values.push(typeId)

        index++

    }

    if (status) {

        conditions.push(`
            d.status = $${index}
        `)

        values.push(status)

        index++

    }

    if (keyword) {

        conditions.push(`
            (
                d.title ILIKE $${index}
            )
        `)

        values.push(`%${keyword}%`)

        index++

    }

    const sql = `
        SELECT
            d.id,
            d.title,

            d.cycle_unit,
            d.cycle_value,

            d.first_due_date,

            d.active_from,
            d.active_to,

            d.requires_result_file,

            d.status,

            t.id AS type_id,
            t.code AS type_code,
            t.name AS type_name

        FROM periodic_work_definitions d

        INNER JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id

        WHERE ${conditions.join(' AND ')}


        ORDER BY
            t.code ASC,
            d.created_at,
            d.id
    `

    return db.query(sql, values)

}



exports.getDefinitionById = async (id, campusId) => {

    const sql = `
        SELECT
            d.id,
            d.campus_id,
            d.periodic_work_type_id,
            d.title,

            d.cycle_unit,
            d.cycle_value,

            d.first_due_date,

            d.active_from,
            d.active_to,

            d.requires_result_file,

            d.status,
            t.code AS type_code
        FROM periodic_work_definitions d

        INNER JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id
        WHERE d.id = $1
          AND d.campus_id = $2
    `

    return db.query(sql, [id, campusId])

}



exports.createDefinition = async ({
    campus_id,
    periodic_work_type_id,
    title,

    cycle_unit,
    cycle_value,

    first_due_date,

    active_from,
    active_to,

    requires_result_file,

    status
}) => {

    const sql = `
        INSERT INTO periodic_work_definitions
        (
            campus_id,
            periodic_work_type_id,
            title,

            cycle_unit,
            cycle_value,

            first_due_date,

            active_from,
            active_to,

            requires_result_file,

            status
        )
        VALUES
        (
            $1, $2, $3,
            $4, $5,
            $6,
            $7, $8,
            $9,
            $10
        )
        RETURNING *
    `

    return db.query(sql, [
        campus_id,
        periodic_work_type_id,
        title,

        cycle_unit,
        cycle_value,

        first_due_date,

        active_from || null,
        active_to || null,

        requires_result_file || false,

        status
    ])

}



exports.updateDefinition = async ({
    id,
    campus_id,

    periodic_work_type_id,
    title,

    cycle_unit,
    cycle_value,

    first_due_date,

    active_from,
    active_to,

    requires_result_file,

    status
}) => {

    const sql = `
        UPDATE periodic_work_definitions
        SET
            periodic_work_type_id = $3,
            title = $4,

            cycle_unit = $5,
            cycle_value = $6,

            first_due_date = $7,

            active_from = $8,
            active_to = $9,

            requires_result_file = $10,

            status = $11

        WHERE id = $1
          AND campus_id = $2

        RETURNING *
    `

    return db.query(sql, [
        id,
        campus_id,

        periodic_work_type_id,
        title,

        cycle_unit,
        cycle_value,

        first_due_date,

        active_from || null,
        active_to || null,

        requires_result_file || false,

        status
    ])

}



exports.deleteDefinition = async (id, campusId) => {

    const sql = `
        DELETE FROM periodic_work_definitions
        WHERE id = $1
          AND campus_id = $2
    `

    return db.query(sql, [id, campusId])

}

exports.updateDefinitionStatus = async (
    id,
    campusId,
    status
) => {

    const sql = `
        UPDATE periodic_work_definitions
        SET status = $3
        WHERE id = $1
          AND campus_id = $2
        RETURNING *
    `

    return db.query(sql, [
        id,
        campusId,
        status
    ])

}
exports.getJobs = async ({
    campusId,
    month,
    typeId,
    status
}) => {

    const conditions = [
        'j.campus_id = $1'
    ]

    const values = [campusId]

    let index = 2

    if (month) {

        conditions.push(`
            TO_CHAR(j.due_date, 'YYYY-MM') = $${index}
        `)

        values.push(month)

        index++

    }

    if (typeId) {

        conditions.push(`
            d.periodic_work_type_id = $${index}
        `)

        values.push(typeId)

        index++

    }

    if (status) {

        conditions.push(`
            j.status = $${index}
        `)

        values.push(status)

        index++

    }

    const sql = `
        SELECT
            j.id,
            j.status,
            j.due_date,
            j.completed_at,

            d.title,

            t.name AS type_name,
            t.code AS type_code,

            room_progress.total_rooms,
            room_progress.done_rooms

        FROM periodic_jobs j

        INNER JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        INNER JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id

        LEFT JOIN (
            SELECT
                job_id,
                COUNT(*) AS total_rooms,
                COUNT(
                    CASE
                        WHEN status = 'done'
                        THEN 1
                    END
                ) AS done_rooms
            FROM periodic_job_rooms
            GROUP BY job_id
        ) room_progress
            ON room_progress.job_id = j.id

        WHERE ${conditions.join(' AND ')}

        ORDER BY
            j.due_date DESC,
            j.id DESC
    `

    return db.query(sql, values)

}
exports.getJobDetail = async (
    id,
    campusId
) => {

    const sql = `
        SELECT
            j.id,
            j.status,
            j.due_date,
            j.completed_at,
            j.note,

            d.title,

            t.name AS type_name,
            t.code AS type_code

        FROM periodic_jobs j

        INNER JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        INNER JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id

        WHERE j.id = $1
          AND j.campus_id = $2
    `

    return db.query(sql, [
        id,
        campusId
    ])

}



exports.updateJobStatus = async (
    id,
    campusId,
    status
) => {

    const sql = `
        UPDATE periodic_jobs
        SET status = $3
        WHERE id = $1
          AND campus_id = $2
        RETURNING *
    `

    return db.query(sql, [
        id,
        campusId,
        status
    ])

}



exports.updateJobCompletedAt = async (id) => {

    const sql = `
        UPDATE periodic_jobs
        SET completed_at = NOW()
        WHERE id = $1
    `

    return db.query(sql, [id])

}



exports.clearJobCompletedAt = async (id) => {

    const sql = `
        UPDATE periodic_jobs
        SET completed_at = NULL
        WHERE id = $1
    `

    return db.query(sql, [id])

}
exports.getJobRuntimeDetail = async (
    id,
    campusId
) => {

    const sql = `
        SELECT
            j.id,
            j.status,
            j.due_date,
            j.completed_at,
            j.note,
            j.work_group,
            j.work_type,
            d.title,
            d.requires_result_file,

            t.code AS type_code,
            t.name AS type_name

        FROM periodic_jobs j

        INNER JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        INNER JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id

        WHERE j.id = $1
          AND j.campus_id = $2
    `

    return db.query(sql, [
        id,
        campusId
    ])

}
exports.getJobAttachments = async (jobId) => {

    const sql = `
        SELECT
            a.id,
            a.type,

            f.id AS file_id,
            f.original_filename AS original_name,
            f.mime_type

        FROM periodic_job_attachments a

        INNER JOIN files f
            ON f.id = a.file_id

        WHERE a.job_id = $1

        ORDER BY a.id DESC
    `

    return db.query(sql, [jobId])

}
exports.createJob = async ({
    campus_id,
    definition_id,
    due_date
}) => {

    const sql = `
        INSERT INTO periodic_jobs
        (
            campus_id,
            definition_id,
            due_date,
            status
        )
        VALUES
        (
            $1,
            $2,
            $3,
            'pending'
        )
        RETURNING *
    `

    return db.query(sql, [
        campus_id,
        definition_id,
        due_date
    ])

}
exports.findExistingJob = async (
    definitionId,
    dueDate
) => {

    const sql = `
        SELECT id
        FROM periodic_jobs
        WHERE definition_id = $1
          AND due_date = $2
        LIMIT 1
    `

    return db.query(sql, [
        definitionId,
        dueDate
    ])

}
exports.findPreviousInspectionJob = async (
    definitionId,
    dueDate
) => {

    const sql = `
        SELECT
            id
        FROM periodic_jobs
        WHERE definition_id = $1
          AND due_date < $2
        ORDER BY due_date DESC
        LIMIT 1
    `

    return db.query(sql, [
        definitionId,
        dueDate
    ])

}
exports.cloneInspectionRooms = async (
    newJobId,
    previousJobId
) => {

    const sql = `
        INSERT INTO periodic_job_rooms
        (
            job_id,
            room_id,
            status
        )
        SELECT
            $1,
            room_id,
            'pending'
        FROM periodic_job_rooms
        WHERE job_id = $2
    `

    return db.query(sql, [
        newJobId,
        previousJobId
    ])

}
exports.assignRoomsToJob = async (
    jobId,
    roomIds
) => {

    if (!roomIds.length) {
        return
    }

    const values = []

    const placeholders = []

    let index = 1

    roomIds.forEach(roomId => {

        placeholders.push(`
            ($${index}, $${index + 1}, 'pending')
        `)

        values.push(jobId)
        values.push(roomId)

        index += 2

    })

    const sql = `
        INSERT INTO periodic_job_rooms
        (
            job_id,
            room_id,
            status
        )
        VALUES
        ${placeholders.join(',')}

        ON CONFLICT (job_id, room_id)
        DO NOTHING
    `

    return db.query(sql, values)

}
exports.removeRoomFromJob = async (
    jobId,
    roomId
) => {

    const sql = `
        DELETE FROM periodic_job_rooms
        WHERE job_id = $1
          AND room_id = $2
    `

    return db.query(sql, [
        jobId,
        roomId
    ])

}

exports.updateJobBusinessInfo = async (
    jobId,
    payload
) => {

    const sql = `
        UPDATE periodic_jobs
        SET
            work_group = $2,
            work_type = $3,
            contractor_id = $4
        WHERE id = $1
        RETURNING *
    `

    return db.query(sql, [
        jobId,
        payload.work_group,
        payload.work_type,
        payload.contractor_id || null
    ])

}
