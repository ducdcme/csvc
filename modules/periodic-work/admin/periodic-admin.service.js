/**
 * Service
 * Handle business logic
 */

const repo = require('./periodic-admin.repository')

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

exports.getTypes = async () => {

    const { rows } = await repo.getTypes()

    return rows

}



/*
|--------------------------------------------------------------------------
| DEFINITIONS
|--------------------------------------------------------------------------
*/

exports.getDefinitions = async (
    campusId,
    query
) => {

    const { rows } =
        await repo.getDefinitions({
            campusId,
            typeId: query.type_id,
            status: query.status,
            keyword: query.keyword
        })

    return rows

}



exports.getDefinitionById = async (id, campusId) => {

    const { rows } = await repo.getDefinitionById(id, campusId)

    const item = rows[0]

    if (!item) {
        throw new Error('Definition not found')
    }

    return item

}
exports.findExistingJob = async (definitionId, dueDate) => {

    const sql = `SELECT id
                FROM periodic_jobs
                WHERE definition_id = $1 AND due_date = $2
                LIMIT 1`

    return db.query(sql, [definitionId, dueDate])

}


exports.createDefinition = async (
    campusId,
    payload
) => {

    validateDefinition(payload)

    const { rows } =
        await repo.createDefinition({
            campus_id: campusId,

            periodic_work_type_id:
                payload.periodic_work_type_id,

            title:
                payload.title,

            cycle_unit:
                payload.cycle_unit,

            cycle_value:
                payload.cycle_value,

            first_due_date:
                payload.first_due_date,

            active_from:
                payload.active_from,

            active_to:
                payload.active_to,

            requires_result_file:
                payload.requires_result_file,

            status:
                payload.status || 'ACTIVE'
        })

    return rows[0]

}



exports.updateDefinition = async (
    id,
    campusId,
    payload
) => {

    await exports.getDefinitionById(
        id,
        campusId
    )

    validateDefinition(payload)

    const { rows } =
        await repo.updateDefinition({
            id,
            campus_id: campusId,

            periodic_work_type_id:
                payload.periodic_work_type_id,

            title:
                payload.title,

            cycle_unit:
                payload.cycle_unit,

            cycle_value:
                payload.cycle_value,

            first_due_date:
                payload.first_due_date,

            active_from:
                payload.active_from,

            active_to:
                payload.active_to,

            requires_result_file:
                payload.requires_result_file,

            status:
                payload.status
        })

    return rows[0]

}



exports.deleteDefinition = async (
    id,
    campusId
) => {

    await exports.getDefinitionById(
        id,
        campusId
    )

    await repo.deleteDefinition(
        id,
        campusId
    )

}

exports.updateDefinitionStatus = async (
    id,
    campusId,
    status
) => {

    const validStatus = [
        'ACTIVE',
        'INACTIVE'
    ]

    if (!validStatus.includes(status)) {
        throw new Error('Invalid status')
    }

    await exports.getDefinitionById(
        id,
        campusId
    )

    const { rows } =
        await repo.updateDefinitionStatus(
            id,
            campusId,
            status
        )

    return rows[0]

}
exports.getJobs = async (
    campusId,
    query
) => {

    const { rows } =
        await repo.getJobs({
            campusId,
            month: query.month,
            typeId: query.type_id,
            status: query.status
        })

    return rows.map(item => {

        const dueDate = new Date(item.due_date)

        const today = new Date()

        today.setHours(0, 0, 0, 0)

        let displayStatus = item.status

        if (
            item.status !== 'done'
            && dueDate < today
        ) {
            displayStatus = 'overdue'
        }

        return {
            ...item,
            display_status: displayStatus
        }

    })

}
exports.getJobDetail = async (
    id,
    campusId
) => {

    const { rows } =
        await repo.getJobDetail(
            id,
            campusId
        )

    const item = rows[0]

    if (!item) {
        throw new Error('Job not found')
    }

    return item

}



exports.updateJobStatus = async (
    id,
    campusId,
    userId,
    status
) => {

    const validStatus = [
        'pending',
        'done',
        'skipped'
    ]

    if (!validStatus.includes(status)) {
        throw new Error('Invalid status')
    }

    const job =
        await exports.getJobDetail(
            id,
            campusId
        )

    // ===== DONE =====
    if (status === 'done') {

        const { rows } =
            await repo.updateJobStatus(
                id,
                campusId,
                'done'
            )

        await repo.updateJobCompletedAt(id)

        return rows[0]

    }

    // ===== REOPEN =====
    if (status === 'pending') {

        if (job.type_code === 'inspection') {
            throw new Error('Inspection job cannot reopen')
        }

        const { rows } =
            await repo.updateJobStatus(
                id,
                campusId,
                'pending'
            )

        await repo.clearJobCompletedAt(id)

        return rows[0]

    }

    // ===== SKIPPED =====
    if (status === 'skipped') {

        const { rows } =
            await repo.updateJobStatus(
                id,
                campusId,
                'skipped'
            )

        return rows[0]

    }

}
exports.getJobRuntimeDetail = async (
    id,
    campusId
) => {

    const { rows } =
        await repo.getJobRuntimeDetail(
            id,
            campusId
        )

    const job = rows[0]

    if (!job) {
        throw new Error('Job not found')
    }

    const attachmentRes =
        await repo.getJobAttachments(id)

    job.attachments =
        attachmentRes.rows

    return job

}
exports.generateJob = async (campusId, payload) => {

    const definition = await exports.getDefinitionById(payload.definition_id, campusId)

    // ===== CHECK EXIST =====
    const existing = await repo.findExistingJob(payload.definition_id, payload.due_date)

    if (existing.rows.length) {
        throw new Error('Job already exists')
    }

    // ===== CREATE JOB =====
    const { rows } = await repo.createJob({ campus_id: campusId, definition_id: payload.definition_id, due_date: payload.due_date })

    const job = rows[0]

    // ===== INSPECTION =====
    if (definition.type_code === 'inspection') {

        const previousJob =
            await repo.findPreviousInspectionJob(
                definition.id,
                payload.due_date
            )

        // ===== AUTO CLONE ROOM LIST =====
        if (previousJob.rows.length) {

            await repo.cloneInspectionRooms(
                job.id,
                previousJob.rows[0].id
            )

        }

    }

    return job

}

exports.assignRoomsToJob = async (
    jobId,
    campusId,
    roomIds
) => {

    const job =
        await exports.getJobDetail(
            jobId,
            campusId
        )

    if (job.type_code !== 'inspection') {
        throw new Error(
            'Only inspection job can assign rooms'
        )
    }

    await repo.assignRoomsToJob(
        jobId,
        roomIds
    )

    return true

}



exports.removeRoomFromJob = async (
    jobId,
    roomId,
    campusId
) => {

    const job =
        await exports.getJobDetail(
            jobId,
            campusId
        )

    if (job.type_code !== 'inspection') {
        throw new Error(
            'Only inspection job can remove rooms'
        )
    }

    await repo.removeRoomFromJob(
        jobId,
        roomId
    )

}
/*
|--------------------------------------------------------------------------
| VALIDATE
|--------------------------------------------------------------------------
*/

function validateDefinition(payload) {

    if (!payload.title?.trim()) {
        throw new Error('Title is required')
    }

    if (!payload.periodic_work_type_id) {
        throw new Error('Type is required')
    }

    if (!payload.cycle_unit) {
        throw new Error('Cycle unit is required')
    }

    if (!payload.cycle_value) {
        throw new Error('Cycle value is required')
    }

    if (!payload.first_due_date) {
        throw new Error('First due date is required')
    }
    const validUnits = ['day', 'week', 'month', 'year']

    if (!validUnits.includes(payload.cycle_unit)) {
        throw new Error('Invalid cycle unit')
    }

    if (Number(payload.cycle_value) <= 0) {
        throw new Error('Cycle value must be greater than 0')
    }
}

exports.updateJobBusinessInfo = async (
    jobId,
    campusId,
    payload
) => {

    const job =
        await exports.getJobDetail(
            jobId,
            campusId
        )

    // ===== VALIDATE WORK TYPE =====
    const validTypes = [
        'INTERNAL',
        'EXTERNAL'
    ]

    if (
        payload.work_type
        &&
        !validTypes.includes(
            payload.work_type
        )
    ) {

        throw new Error(
            'Invalid work type'
        )

    }

    // ===== INTERNAL =====
    if (
        payload.work_type === 'INTERNAL'
    ) {

        payload.contractor_id = null

    }

    const { rows } =
        await repo.updateJobBusinessInfo(
            job.id,
            payload
        )

    return rows[0]

}
