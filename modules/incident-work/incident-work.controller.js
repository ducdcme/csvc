// Controller: Incident Work Controller

const service = require('./incident-work.service');

const response = (res, data = {}, message = 'OK') => {
    res.json({ success: true, message, data, pagination: null });
};

exports.create = async (req, res) => {

    try {

        const data = await service.create(req.body, req.user);

        return res.json({
            success: true,
            message: 'Created',
            data
        });

    } catch (e) {

        return res.json({
            success: false,
            message: e.message
        });
    }
};
exports.createIncident = async (req, res) => {
    try {

        const incident = await service.createIncident(
            req.body,
            req.user
        );

        res.json({
            success: true,
            message: 'Incident created',
            data: incident
        });

    } catch (e) {

        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};
exports.getList = async (req, res) => {
    try {
        const data = await service.getList(req.query, req.user);
        response(res, data);
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.getDetail = async (req, res) => {
    try {
        const data = await service.getDetail(req.params.id, req.user);
        response(res, data);
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.approveInternal = async (req, res) => {
    try {
        await service.approveInternal(req.params.id, req.user);
        response(res, {}, 'Approved');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.startContracting = async (req, res) => {
    try {
        await service.startContracting(req.params.id, req.user);
        response(res, {}, 'Contracting started');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.selectContractor = async (req, res) => {
    try {
        await service.selectContractor(req.params.id, req.body.contractor_id, req.user);
        response(res, {}, 'Contractor selected');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.startWork = async (req, res) => {
    try {
        await service.startWork(req.params.id, req.user);
        response(res, {}, 'Started');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.completeItem = async (req, res) => {
    try {
        await service.completeItem(req.params.itemId, req.body, req.user);
        response(res, {}, 'Item completed');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

exports.closeIncident = async (req, res) => {
    try {
        await service.closeIncident(req.params.id, req.user);
        response(res, {}, 'Closed');
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
// Controller:
exports.createChecklist = async (req, res) => {
    try {
        const data = await service.createChecklist(req.params.id, req.body, req.user);

        res.json({ success: true, message: 'Checklist created', data, pagination: null });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};
//Update Incident
exports.updateIncident = async (req, res) => {
    try {
        const incident = await service.updateIncident(
            req.params.id,
            req.body,
            req.user
        );


        res.json({
            success: true,
            message: 'Incident updated',
            data: incident
        });

    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }

};

exports.updateChecklistItem = async (req, res) => {

    try {

        const item = await service.updateChecklistItem(
            req.params.itemId,
            req.body,
            req.user
        );

        res.json({
            success: true,
            message:
                'Checklist item updated',
            data: item
        });

    } catch (e) {

        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

exports.deleteChecklistItem = async (req, res) => {
    try {
        await service.deleteChecklistItem(req.params.itemId, req.user);

        res.json({
            success: true,
            message:
                'Checklist item deleted'
        });

    } catch (e) {

        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};
