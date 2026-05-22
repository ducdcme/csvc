const db = require('../database/connection');
const path = require('path');
const fs = require('fs');
const uploadService = require('./upload.service');
const { FILE_MODULE, FILE_CATEGORY } = require('./file.constants');

exports.uploadFile = async (req, res) => {
    const client = await db.connect();

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required'
            });
        }

        const campus_id = req.campus_id;

        if (!campus_id) {
            return res.status(400).json({
                success: false,
                message: 'Campus not selected'
            });
        }

        await client.query('BEGIN');

        const fileCategory =
            req.file.mimetype.startsWith('image/')
                ? FILE_CATEGORY.IMAGE
                : FILE_CATEGORY.FILE;

        const file = await uploadService.saveFile(
            client,
            { campus_id },
            req.file,
            req.query.module_name || null,
            fileCategory
        );
        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Upload success',
            data: {
                file_id: file.id,
                file_name: req.file.originalname,
                file_url: `/api/files/${file.id}`
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');

        res.status(500).json({
            success: false,
            message: err.message
        });
    } finally {
        client.release();
    }
};
exports.getFile = async (req, res) => {
    try {
        const file = await uploadService.getFileById(req.params.id);

        if (!file) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        // 🔒 SECURITY: check campus
        if (req.campus_id && file.campus_id !== req.campus_id) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const filePath = path.resolve(file.stored_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File missing" });
        }

        res.setHeader('Content-Type', file.mime_type);
        res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);

        fs.createReadStream(filePath).pipe(res);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Upload temp file for inspection
exports.uploadTempInspection = async (req, res) => {

    const client = await db.connect();

    try {

        const campus_id = req.session.campus_id;
        const user_id = req.session?.user?.id || null;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "file is required"
            });
        }

        await client.query('BEGIN');

        const file = await uploadService.saveFile(
            client,
            { campus_id, user_id },
            req.file,
            FILE_MODULE.INSPECTION,
            FILE_CATEGORY.IMAGE
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            data: {
                file_id: file.id
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};