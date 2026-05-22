// Service: Incident Work Service

const repo = require('./incident-work.repository');
const db = require('../../infrastructure/database/connection');

const STATUS = {
    OPEN: 'OPEN',
    CONTRACTING: 'CONTRACTING',
    PLANNING: 'PLANNING',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEWING: 'REVIEWING',
    CLOSED: 'CLOSED'
};

// ===== CREATE =====
// Service: create incident (FIX start_date)

exports.create = async (
    data,
    user
) => {

    if (!data.title) {
        throw new Error('Title required');
    }

    if (!data.due_date) {
        throw new Error('Due date required');
    }
    if (!data.start_date) {
        throw new Error('Start date required');
    }
    if (
        data.start_date &&
        data.due_date <
        data.start_date
    ) {
        throw new Error(
            'Due date invalid'
        );
    }

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        const incident =
            await repo.create(
                client,
                data,
                user
            );

        await client.query('COMMIT');

        return incident;

    } catch (e) {

        await client.query('ROLLBACK');

        throw e;

    } finally {

        client.release();
    }
};
// ===== LIST =====
exports.getList = async (query, user) => {

    const rows = await repo.getList(query, user.campus_id);

    const now = new Date();

    const mapped = rows.map(i => {

        const total = Number(i.total_items || 0);
        const done = Number(i.done_items || 0);

        return {
            ...i,

            progress: {
                total,
                done,
                percent: total
                    ? Math.round((done / total) * 100)
                    : 0
            },

            overdue:
                i.status !== STATUS.CLOSED &&
                i.due_date &&
                now > new Date(i.due_date)
        };
    });

    const internal = mapped.filter(i =>
        i.work_type === 'INTERNAL' &&
        i.status !== STATUS.CLOSED
    );

    const external = mapped.filter(i =>
        i.work_type === 'EXTERNAL' &&
        i.status !== STATUS.CLOSED
    );

    const recent_closed = mapped
        .filter(i => i.status === STATUS.CLOSED)
        .slice(0, 10);

    return {

        internal,

        external,

        recent_closed,

        summary: {
            internal: internal.length,
            external: external.length,
            overdue: mapped.filter(i => i.overdue).length
        }
    };
};
// ===== DETAIL =====

exports.getDetail = async (id, user) => {

    // incident
    const incident = await repo.getById(
        id,
        user.campus_id
    );

    if (!incident) {
        throw new Error('Incident not found');
    }

    // checklist
    const checklistRows =
        await repo.getChecklistFull(id);

    // normalize checklist
    const checklist = checklistRows.map(i => ({

        id: i.id,

        name: i.name,

        order_index: i.order_index,

        is_required: i.is_required,

        completed: !!i.log_id,

        log: i.log_id
            ? {
                id: i.log_id,

                note: i.note,

                done_by: i.done_by,

                done_by_name: i.done_by_name,

                created_at: i.created_at,

                attachment_count:
                    Number(i.attachment_count || 0),

                attachment_ids: i.attachment_ids || []

            }
            : null
    }));

    // progress
    const total = checklist.length;

    const done = checklist.filter(
        i => i.completed
    ).length;

    const progress = {

        total,

        done,

        percent: total
            ? Math.round((done / total) * 100)
            : 0
    };

    // overdue
    const now = new Date();

    const overdue =
        incident.status !== STATUS.CLOSED &&
        incident.due_date &&
        now > new Date(incident.due_date);

    // return
    return {

        incident: {
            ...incident,
            overdue
        },

        progress,

        checklist
    };
};

// ===== WORKFLOW =====
exports.approveInternal = async (id, user) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const incident = await repo.getById(id, user.campus_id);

        if (incident.work_type !== 'INTERNAL') throw new Error('Invalid flow');
        if (incident.status !== STATUS.OPEN) throw new Error('Invalid state');

        await repo.updateStatus(client, id, STATUS.CONTRACTING);
        await repo.log(client, id, STATUS.OPEN, STATUS.CONTRACTING, 'approve', user);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

exports.startContracting = async (id, user) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const incident = await repo.getById(id, user.campus_id);
        if (incident.status !== STATUS.OPEN) {
            throw new Error('Invalid state');
        }
        if (incident.work_type !== 'EXTERNAL') {
            throw new Error('Invalid flow');
        }
        await repo.updateStatus(client, id, STATUS.CONTRACTING);
        await repo.createLog(client, {
            incident_id: incident.id,
            from_status: STATUS.OPEN,
            to_status: STATUS.CONTRACTING,
            action: 'START_CONTRACTING',
            done_by: user.id,
            campus_id: user.campus_id,
            note: 'Move to contractor assignment'
        });
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

exports.selectContractor = async (id, contractorId, user) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const incident = await repo.getById(id, user.campus_id);
        if (incident.status !== STATUS.CONTRACTING) throw new Error('Invalid state');

        await repo.updateContractor(client, id, contractorId);
        await repo.updateStatus(client, id, STATUS.PLANNING);

        await repo.log(client, id, STATUS.CONTRACTING, STATUS.PLANNING, 'select_contractor', user);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

exports.startWork = async (id, user) => {
    const incident = await repo.getById(id, user.campus_id);

    if (incident.status !== STATUS.PLANNING) {
        throw new Error('Invalid state');
    }

    // ❗ check đã có checklist chưa
    const checklist = await repo.getChecklist(id);

    if (!checklist || checklist.length === 0) {
        throw new Error('Checklist not created');
    }

    await repo.updateStatus(null, id, STATUS.IN_PROGRESS);
};
exports.completeItem = async (
    itemId,
    data,
    user
) => {

    // validate attachment
    if (!data.files || data.files.length === 0) {
        throw new Error('Attachment required');
    }

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        // item
        const item =
            await repo.getItem(itemId);

        if (!item) {
            throw new Error('Item not found');
        }

        // incident
        const incident =
            await repo.getById(
                item.incident_id,
                user.campus_id
            );

        if (!incident) {
            throw new Error('Incident not found');
        }

        // state
        if (
            incident.status !== STATUS.IN_PROGRESS
        ) {
            throw new Error('Invalid state');
        }

        // already completed
        const isDone =
            await repo.checkItemDone(itemId);

        if (isDone) {
            throw new Error(
                'Item already completed'
            );
        }

        // create execution log
        const log =
            await repo.insertChecklistLog(
                client,
                itemId,
                user,
                data.note
            );

        // attachments
        for (const fileId of data.files) {

            await repo.insertAttachment(
                client,
                log.id,
                fileId
            );
        }

        // all done
        const allDone =
            await repo.checkAllDone(client, item.incident_id);

        // auto move reviewing
        if (allDone) {

            await repo.updateStatus(
                client,
                item.incident_id,
                STATUS.REVIEWING
            );
        }

        await client.query('COMMIT');

        return {
            completed: true
        };

    } catch (e) {

        await client.query('ROLLBACK');

        throw e;

    } finally {

        client.release();
    }
};

// Service: close incident

exports.closeIncident = async (id, user) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const incident = await repo.getById(id, user.campus_id);
        if (incident.status !== STATUS.REVIEWING) throw new Error('Invalid state');

        await repo.updateStatus(client, id, STATUS.CLOSED);
        await repo.log(client, id, STATUS.REVIEWING, STATUS.CLOSED, 'close', user);

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
// Service: create checklist
exports.createChecklist = async (incidentId, data, user) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const incident = await repo.getById(incidentId, user.campus_id);

        if (incident.status !== 'PLANNING') {
            throw new Error('Invalid state');
        }

        if (!data.items || data.items.length === 0) {
            throw new Error('Checklist items required');
        }

        const checklist = await repo.createChecklist(client, incidentId, user);

        let index = 1;

        for (const item of data.items) {
            if (!item.name) {
                throw new Error('Item name required');
            }

            await repo.createItem(client, checklist.id, {
                name: item.name,
                type: null, // 👈 bỏ type
                order_index: index++
            });
        }

        await client.query('COMMIT');
        return checklist;

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};


exports.createIncident = async (
    data,
    user
) => {

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        validateCreatePayload(data);

        const incident = await repo.createIncident(
            client,
            {
                title: data.title.trim(),

                description:
                    data.description.trim(),

                note:
                    data.note?.trim() || null,

                work_type:
                    data.work_type,

                work_group:
                    data.work_group?.trim() || null,

                start_date:
                    data.start_date,

                due_date:
                    data.due_date,

                campus_id:
                    user.campus_id,

                created_by:
                    user.id
            }
        );

        await repo.createLog(client, {
            incident_id: incident.id,

            from_status: null,

            to_status: 'OPEN',

            action: 'CREATE_INCIDENT',

            done_by: user.id,

            campus_id: user.campus_id,

            note: 'Incident created'
        });

        await client.query('COMMIT');

        return incident;

    } catch (e) {

        await client.query('ROLLBACK');

        throw e;

    } finally {

        client.release();
    }
};

exports.updateIncident = async (
    id,
    data,
    user
) => {

    const client = await db.connect();

    try {

        await client.query('BEGIN');

        const incident = await repo.getById(
            id,
            user.campus_id
        );

        if (!incident) {
            throw new Error(
                'Incident not found'
            );
        }

        if (
            incident.status === 'CLOSED'
        ) {
            throw new Error(
                'Closed incident cannot be edited'
            );
        }

        const allowedFields =
            getAllowedFields(
                incident.status
            );

        const payload = {};

        for (const field of allowedFields) {

            if (
                data[field] !== undefined
            ) {
                payload[field] =
                    typeof data[field] === 'string'
                        ? data[field].trim()
                        : data[field];
            }
        }

        if (
            !Object.keys(payload).length
        ) {
            throw new Error(
                'No editable fields provided'
            );
        }

        const nextStartDate =
            payload.start_date ||
            incident.start_date;

        const nextDueDate =
            payload.due_date ||
            incident.due_date;

        if (
            new Date(nextDueDate) <
            new Date(nextStartDate)
        ) {
            throw new Error(
                'Due date must be greater than or equal to start date'
            );
        }

        if (
            payload.due_date &&
            String(payload.due_date) !==
            formatDate(
                incident.due_date
            )
        ) {

            await repo.createLog(
                client,
                {
                    incident_id:
                        incident.id,

                    from_status:
                        null,

                    to_status:
                        null,

                    action:
                        'UPDATE_DUE_DATE',

                    done_by:
                        user.id,

                    campus_id:
                        user.campus_id,

                    note:
                        `Due date changed from ` +
                        `${formatDate(incident.due_date)} ` +
                        `to ${payload.due_date}`
                }
            );
        }

        await repo.updateIncident(
            client,
            incident.id,
            payload
        );

        const updated =
            await repo.getById(
                incident.id,
                user.campus_id
            );

        await client.query('COMMIT');

        return updated;

    } catch (e) {

        await client.query('ROLLBACK');

        throw e;

    } finally {

        client.release();
    }
};

function validateCreatePayload(
    data
) {

    if (!data.title?.trim()) {
        throw new Error(
            'Title is required'
        );
    }

    if (
        !data.description?.trim()
    ) {
        throw new Error(
            'Description is required'
        );
    }

    if (!data.work_type) {
        throw new Error(
            'Work type is required'
        );
    }

    if (!data.start_date) {
        throw new Error(
            'Start date is required'
        );
    }

    if (!data.due_date) {
        throw new Error(
            'Due date is required'
        );
    }

    const startDate =
        new Date(data.start_date);

    const dueDate =
        new Date(data.due_date);

    if (dueDate < startDate) {
        throw new Error(
            'Due date must be greater than or equal to start date'
        );
    }
}

function getAllowedFields(
    status
) {

    switch (status) {

        case 'OPEN':

        case 'CONTRACTING':

        case 'PLANNING':

            return [
                'title',
                'description',
                'note',
                'work_group',
                'start_date',
                'due_date'
            ];

        case 'IN_PROGRESS':

            return [
                'note',
                'due_date'
            ];

        case 'REVIEWING':

            return [
                'note'
            ];

        default:
            return [];
    }
}

function formatDate(date) {

    if (!date) {
        return '-';
    }

    return new Date(date)
        .toISOString()
        .split('T')[0];
}

exports.updateChecklistItem = async (
    itemId,
    data,
    user
) => {

    const item =
        await repo.getChecklistItemById(
            itemId
        );

    if (!item) {
        throw new Error(
            'Checklist item not found'
        );
    }

    const incident =
        await repo.getById(
            item.incident_id,
            user.campus_id
        );

    if (!incident) {
        throw new Error(
            'Incident not found'
        );
    }

    if (
        incident.status !== STATUS.PLANNING
    ) {
        throw new Error(
            'Checklist can only be edited in planning state'
        );
    }

    if (!data.name?.trim()) {
        throw new Error(
            'Item name is required'
        );
    }

    await repo.updateChecklistItem(
        itemId,
        data.name.trim()
    );

    return await repo.getChecklistItemById(
        itemId
    );
};

exports.deleteChecklistItem = async (
    itemId,
    user
) => {

    const item =
        await repo.getChecklistItemById(
            itemId
        );

    if (!item) {
        throw new Error(
            'Checklist item not found'
        );
    }

    const incident =
        await repo.getById(
            item.incident_id,
            user.campus_id
        );

    if (!incident) {
        throw new Error(
            'Incident not found'
        );
    }

    if (
        incident.status !== STATUS.PLANNING
    ) {
        throw new Error(
            'Checklist can only be edited in planning state'
        );
    }

    await repo.deleteChecklistItem(
        itemId
    );
};
