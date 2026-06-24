const db = require('../../infrastructure/database/connection');

// GET LIST
exports.getList = async () => {
    const r = await db.query(
        `SELECT
            id,
            name,
            address,
            contact,
            phone,
            contact2,
            phone2,
            type,
            created_at
        FROM contractors
        WHERE is_active = TRUE
        ORDER BY id DESC`
    );

    return r.rows;
};

// GET BY ID
exports.getById = async (id) => {
    const r = await db.query(
        `SELECT
            id,
            name,
            address,
            contact,
            phone,
            contact2,
            phone2,
            type,
            created_at
        FROM contractors
        WHERE id = $1
        LIMIT 1`,
        [id]
    );

    return r.rows[0];
};

// CREATE
exports.create = async (data) => {
    const r = await db.query(
        `INSERT INTO contractors
        (
            name,
            address,
            contact,
            phone,
            contact2,
            phone2,
            type
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
            data.name,
            data.address || null,
            data.contact,
            data.phone,
            data.contact2 || null,
            data.phone2 || null,
            data.type || 'EXTERNAL'
        ]
    );

    return r.rows[0];
};

// UPDATE
exports.update = async (id, data) => {
    const r = await db.query(
        `UPDATE contractors
        SET
            name = $1,
            address = $2,
            contact = $3,
            phone = $4,
            contact2 = $5,
            phone2 = $6,
            type = $7
        WHERE id = $8
        RETURNING *`,
        [
            data.name,
            data.address || null,
            data.contact,
            data.phone,
            data.contact2 || null,
            data.phone2 || null,
            data.type || 'EXTERNAL',
            id
        ]
    );

    return r.rows[0];
};

// SOFT DELETE
exports.delete = async (id) => {
    await db.query(
        `UPDATE contractors
        SET is_active = FALSE
        WHERE id = $1`,
        [id]
    );

    return true;
};