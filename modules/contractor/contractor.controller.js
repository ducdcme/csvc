const service = require('./contractor.service');

exports.getList = async (req, res) => {
    try {
        const data = await service.getList(req.user);

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await service.create(req.body, req.user);

        res.json({
            success: true,
            message: 'Created',
            data,
            pagination: null
        });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};