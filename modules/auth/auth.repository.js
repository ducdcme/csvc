// Repository: Auth SQL

const pool = require('../../infrastructure/database/connection');

// Check user + campus
exports.findUserByUsername = async (username, campus_id) => {
    const query = `
        SELECT u.id, u.username, u.password, u.full_name
        FROM users u
        JOIN user_campus_scopes ucs ON u.id = ucs.user_id
        WHERE u.username = $1
        AND u.is_active = true
        AND ucs.campus_id = $2
    `;
    const result = await pool.query(query, [username, campus_id]);
    return result.rows[0];
};

// Get roles
exports.getUserRoles = async (user_id) => {
    const query = `
        SELECT r.code
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
};

// Get permissions
exports.getUserPermissions = async (user_id) => {
    const query = `
        SELECT DISTINCT p.code
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = $1
        ORDER BY p.code
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
};
// Get user by ID
exports.getUserById = async (userId) => {
    const query = `
        SELECT id, password
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

// Update password
exports.updatePassword = async (userId, passwordHash) => {
    const query = `
        UPDATE users
        SET password = $1,
            updated_at = NOW()
        WHERE id = $2
    `;
    await pool.query(query, [passwordHash, userId]);
};