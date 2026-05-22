/**
 * IMPORT CONTROLLER
 * - Nhận request
 * - Gọi service
 * - Trả response
 */

const importService = require('./import.service');

/**
 * Preview import (validate only, không ghi DB)
 */
exports.previewImportLocations = async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'File Excel is required',
            });
        }

        const result = await importService.previewLocations(file.path);

        return res.json({
            success: true,
            message: 'Preview success',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Import dữ liệu vào DB
 */
exports.importLocations = async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'File Excel is required',
            });
        }

        const result = await importService.importLocations(file.path);

        return res.json({
            success: true,
            message: 'Import success',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
/**
 * Download Excel template
 */
exports.downloadTemplateLocations = async (req, res, next) => {
    try {
        const buffer = await importService.generateTemplateLocations();

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=locations_template.xlsx'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        return res.send(buffer);
    } catch (err) {
        next(err);
    }
};
/**
 * ROOM NAME IMPORT CONTROLLER
 */

/**
 * Preview (validate only)
 */
exports.previewImportRoomNames = async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'File Excel is required'
            });
        }

        const result = await importService.previewImportRoomNames(file.path);

        res.json({
            success: true,
            message: 'Preview success',
            data: result
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Import
 */
exports.importRoomNames = async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'File Excel is required'
            });
        }

        const result = await importService.importRoomNames(file.path);

        res.json({
            success: true,
            message: 'Import success',
            data: result
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Download template
 */
exports.downloadTemplateRoomNames = async (req, res, next) => {
    try {
        const buffer = await importService.generateTemplateRoomNames();

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=room_names_template.xlsx'
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.send(buffer);

    } catch (err) {
        next(err);
    }
};
//Room Name by Year