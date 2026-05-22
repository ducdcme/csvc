/**
 * Repo: chỉ làm việc với DB, không chứa business logic
 */

const db = require('../../../infrastructure/database/connection'); // chỉnh lại path nếu cần

/**
 * Lấy tất cả definition còn hiệu lực
 */
async function getActiveDefinitions() {
    const query = `
    SELECT *
    FROM periodic_work_definitions
    WHERE status = 'ACTIVE'
  `;
    const { rows } = await db.query(query);
    return rows;
}

/**
 * Tạo job mới
 */
async function createJob({ definition_id, campus_id, due_date, title }) {
    const query = `
    INSERT INTO periodic_jobs
    (definition_id, campus_id, due_date, status, created_at)
    VALUES ($1, $2, $3, 'PENDING', NOW())
    RETURNING *
  `;

    const values = [definition_id, campus_id, due_date];
    const { rows } = await db.query(query, values);
    return rows[0];
}

module.exports = {
    getActiveDefinitions,
    createJob,
};