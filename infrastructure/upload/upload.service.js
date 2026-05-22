// infrastructure/upload/upload.service.js

const db = require('../database/connection');
const {
    isValidModule,
    isValidCategory
} = require('./file.constants');

exports.saveFile = async (
    client,
    context,
    file,
    module_name,
    file_category
) => {

    if (!isValidModule(module_name)) {
        throw new Error(`Invalid module_name: ${module_name}`);
    }

    if (!isValidCategory(file_category)) {
        throw new Error(`Invalid file_category: ${file_category}`);
    }

    if (!context || !context.campus_id) {
        throw new Error("campus_id is required");
    }

    if (!file) {
        throw new Error("file is required");
    }

    const { rows } = await client.query(`
        INSERT INTO files
        (
            campus_id,
            module_name,
            file_category,
            original_filename,
            stored_filename,
            stored_path,
            mime_type,
            file_size,
            uploaded_by_user_id,
            status,
            uploaded_at,
            created_at,
            updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',NOW(),NOW(),NOW())
        RETURNING id
    `, [
        context.campus_id,
        module_name,
        file_category,
        file.originalname,
        file.filename,
        file.path,
        file.mimetype,
        file.size,
        context.user_id || null
    ]);

    return rows[0];
};


// ===== GET FILE =====
exports.getFileById = async (file_id) => {
    const { rows } = await db.query(`
        SELECT *
        FROM files
        WHERE id = $1 AND is_active = true
    `, [file_id]);

    return rows[0];
};
