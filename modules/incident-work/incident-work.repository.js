// Repository: Incident Work Repository

const db = require('../../infrastructure/database/connection');

// create
// Repository: create incident (FIX start_date)

exports.create = async (client, data, user) => {

    const r = await client.query(
        `
        INSERT INTO incident_works
        (
            title,
            description,
            note,
            work_type,
            contractor_id,
            campus_id,
            created_by,
            status,
            start_date,
            due_date
        )
        VALUES
        (
            $1,$2,$3,$4,$5,
            $6,$7,$8,$9,$10
        )
        RETURNING *
        `,
        [
            data.title,
            data.description || null,
            data.note || null,
            data.work_type,
            data.contractor_id,
            user.campus_id,
            user.id,
            'OPEN',
            data.start_date,
            data.due_date
        ]
    );

    return r.rows[0];
};

// list

// list
exports.getList = async (query, campusId) => {

    let sql = `
        SELECT

            iw.*,

            COUNT(DISTINCT ci.id) AS total_items,

            COUNT(DISTINCT cl.id) AS done_items

        FROM incident_works iw

        LEFT JOIN incident_checklists c
            ON c.incident_id = iw.id

        LEFT JOIN incident_checklist_items ci
            ON ci.checklist_id = c.id

        LEFT JOIN incident_checklist_logs cl
            ON cl.item_id = ci.id

        WHERE iw.campus_id = $1
    `;

    let params = [campusId];

    if (query.status) {

        params.push(query.status);

        sql += `
            AND iw.status = $${params.length}
        `;
    }

    sql += `
        GROUP BY iw.id
        ORDER BY iw.created_at DESC
    `;

    const r = await db.query(sql, params);

    return r.rows;
};

// detail

exports.getById = async (id, campusId) => {

    const r = await db.query(
        `
        SELECT
            iw.*,
            contractor.name AS contractor_name,
            contractor.contact AS contractor_contact,
            contractor.phone AS contractor_phone

        FROM incident_works iw

        LEFT JOIN contractors contractor
            ON contractor.id = iw.contractor_id

        WHERE iw.id = $1
        AND iw.campus_id = $2
        `,
        [id, campusId]
    );

    return r.rows[0];
};

// checklist
exports.getChecklist = async (incidentId) => {
    const r = await db.query(
        `SELECT * FROM incident_checklist_items WHERE checklist_id IN 
     (SELECT id FROM incident_checklists WHERE incident_id=$1)`,
        [incidentId]
    );
    return r.rows;
};
// Repository: get checklist full (item + log)

// Repository: get checklist full (item + log)

exports.getChecklistFull = async (incidentId) => {

    const r = await db.query(
        `
        SELECT

            i.id,
            i.name,
            i.order_index,
            i.is_required,

            l.id AS log_id,
            l.note,
            l.done_by,
            l.created_at,

            u.full_name AS done_by_name,

            COUNT(a.id) AS attachment_count,
            ARRAY_REMOVE(
                ARRAY_AGG(a.file_id),
                NULL
            ) AS attachment_ids

        FROM incident_checklist_items i

        JOIN incident_checklists c
            ON i.checklist_id = c.id

        LEFT JOIN incident_checklist_logs l
            ON l.item_id = i.id

        LEFT JOIN users u
            ON u.id = l.done_by

        LEFT JOIN incident_checklist_attachments a
            ON a.log_id = l.id

        WHERE c.incident_id = $1

        GROUP BY
            i.id,
            l.id,
            u.full_name

        ORDER BY i.order_index ASC
        `,
        [incidentId]
    );

    return r.rows;
};
// update status
exports.updateStatus = async (client, id, status) => {
    const q = `UPDATE incident_works SET status=$1 WHERE id=$2`;
    return client ? client.query(q, [status, id]) : db.query(q, [status, id]);
};

// update contractor
exports.updateContractor = async (client, id, contractorId) => {
    return client.query(
        `UPDATE incident_works SET contractor_id=$1 WHERE id=$2`,
        [contractorId, id]
    );
};

// log
exports.log = async (client, id, from, to, action, user) => {
    return client.query(
        `INSERT INTO incident_work_logs (incident_id, from_status, to_status, action, done_by, campus_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, from, to, action, user.id, user.campus_id]
    );
};

// get item
exports.getItem = async (itemId) => {
    const r = await db.query(
        `SELECT i.*, c.incident_id
     FROM incident_checklist_items i
     JOIN incident_checklists c ON i.checklist_id = c.id
     WHERE i.id = $1`,
        [itemId]
    );
    return r.rows[0];
};

// repository: insert checklist log
exports.insertChecklistLog = async (
    client,
    itemId,
    user,
    note
) => {

    const r = await client.query(
        `
        INSERT INTO incident_checklist_logs
        (
            item_id,
            done_by,
            note,
            campus_id
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
        [
            itemId,
            user.id,
            note,
            user.campus_id
        ]
    );

    return r.rows[0];
};
// insert attachment
exports.insertAttachment = async (
    client,
    logId,
    fileId
) => {

    return client.query(
        `
        INSERT INTO incident_checklist_attachments
        (
            log_id,
            file_id
        )
        VALUES ($1,$2)
        `,
        [
            logId,
            fileId
        ]
    );
};

// check done
exports.checkAllDone = async (client, incidentId) => {
    const r = await client.query(
        `SELECT COUNT(*) AS total,
            COUNT(l.id) AS done
     FROM incident_checklist_items i
     LEFT JOIN incident_checklist_logs l ON l.item_id = i.id
     WHERE i.checklist_id IN (
       SELECT id FROM incident_checklists WHERE incident_id=$1
     )`,
        [incidentId]
    );

    const total =
        Number(r.rows[0].total);

    const done =
        Number(r.rows[0].done);

    return total > 0 &&
        total === done;
};
// Repository:
exports.createChecklist = async (client, incidentId, user) => {
    const r = await client.query(
        `INSERT INTO incident_checklists (incident_id, campus_id)
     VALUES ($1,$2) RETURNING *`,
        [incidentId, user.campus_id]
    );
    return r.rows[0];
};

exports.createItem = async (client, checklistId, item) => {
    return client.query(
        `INSERT INTO incident_checklist_items (checklist_id, name, order_index)
         VALUES ($1,$2,$3)`,
        [checklistId, item.name, item.order_index]
    );
};
exports.checkItemDone = async (itemId) => {
    const r = await db.query(
        `SELECT id FROM incident_checklist_logs WHERE item_id = $1 LIMIT 1`,
        [itemId]
    );

    return r.rowCount > 0;
};

exports.createIncident = async (
    client,
    data
) => {

    const sql = `
        INSERT INTO incident_works (
            title,
            description,
            note,
            work_type,
            status,
            campus_id,
            created_by,
            start_date,
            due_date,
            work_group
        )
        VALUES (
            $1, $2, $3, $4, 'OPEN',
            $5, $6, $7, $8, $9
        )
        RETURNING *
    `;

    const result =
        await client.query(sql, [
            data.title,
            data.description,
            data.note,
            data.work_type,
            data.campus_id,
            data.created_by,
            data.start_date,
            data.due_date,
            data.work_group
        ]);

    return result.rows[0];
};

exports.updateIncident = async (
    client,
    id,
    data
) => {

    const fields = [];

    const values = [];

    let index = 1;

    for (const key in data) {

        fields.push(
            `${key} = $${index++}`
        );

        values.push(data[key]);
    }

    values.push(id);

    const sql = `
        UPDATE incident_works
        SET
            ${fields.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
    `;

    await client.query(
        sql,
        values
    );
};

exports.createLog = async (
    client,
    data
) => {

    const sql = `
        INSERT INTO incident_work_logs (
            incident_id,
            from_status,
            to_status,
            action,
            done_by,
            note,
            campus_id
        )
        VALUES (
            $1, $2, $3,
            $4, $5, $6, $7
        )
    `;

    await client.query(sql, [
        data.incident_id,
        data.from_status,
        data.to_status,
        data.action,
        data.done_by,
        data.note,
        data.campus_id
    ]);
};

// Repository: get checklist item by ID

exports.getChecklistItemById = async (
    itemId
) => {

    const sql = `
        SELECT
            i.*,
            c.incident_id
        FROM incident_checklist_items i
        INNER JOIN incident_checklists c
            ON c.id = i.checklist_id
        WHERE i.id = $1
    `;

    const result =
        await db.query(sql, [itemId]);

    return result.rows[0];
};

exports.updateChecklistItem = async (
    itemId,
    name
) => {

    const sql = `
        UPDATE incident_checklist_items
        SET name = $1
        WHERE id = $2
    `;

    await db.query(sql, [
        name,
        itemId
    ]);
};

exports.deleteChecklistItem = async (
    itemId
) => {

    const sql = `
        DELETE FROM incident_checklist_items
        WHERE id = $1
    `;

    await db.query(sql, [itemId]);
};
