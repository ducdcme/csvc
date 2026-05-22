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
      type
     FROM contractors
     ORDER BY id DESC`
    );

    return r.rows;
};

// CREATE
exports.create = async (data) => {
    const r = await db.query(
        `INSERT INTO contractors (name, address, contact, phone, type)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
        [
            data.name,
            data.address || null,
            data.contact || null,
            data.phone || null,
            data.type || null
        ]
    );

    return r.rows[0];
};