const service = require('./contractor.service');

exports.getList = async (req, res) => {
    try {
        const data = await service.getList();

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await service.getById(req.params.id);

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await service.create(req.body);

        res.json({
            success: true,
            message: 'Created',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await service.update(
            req.params.id,
            req.body
        );

        res.json({
            success: true,
            message: 'Updated',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        await service.delete(req.params.id);

        res.json({
            success: true,
            message: 'Deleted',
            data: true,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};