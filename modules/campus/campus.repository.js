// Repository: SQL queries for campus

const db = require('../../infrastructure/database/connection');

exports.getAllActiveCampuses = async () => {
    const query = `
        SELECT id, name, code
        FROM campuses
        WHERE is_active = true
        ORDER BY name
    `;
    const result = await db.query(query);
    return result.rows;
};

exports.getCampusById = async (campusId) => {
    const query = `
        SELECT id, name, code
        FROM campuses
        WHERE id = $1
        AND is_active = true
    `;
    const result = await db.query(query, [campusId]);
    return result.rows[0];
};
// Check user belongs to campus
exports.checkUserCampus = async (userId, campusId) => {
    const query = `
        SELECT 1
        FROM user_campus_scopes
        WHERE user_id = $1
        AND campus_id = $2
    `;
    const result = await db.query(query, [userId, campusId]);
    return result.rowCount > 0;
};