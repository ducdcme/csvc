// Controller: Repair controller

const repairService = require('./repair.service');

// ===== LIST =====
exports.getRepairs = async (req, res) => {
    try {
        const result = await repairService.getRepairs(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===== DETAIL =====
exports.getRepairDetail = async (req, res) => {
    try {
        const result = await repairService.getRepairDetail(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===== TECH WORKFLOW =====
exports.receiveRepair = async (req, res) => {
    try {
        const result = await repairService.receiveRepair(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.startRepair = async (req, res) => {
    try {
        const result = await repairService.startRepair(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.completeRepair = async (req, res) => {
    try {
        const result = await repairService.completeRepair(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ===== SUPERVISOR OVERRIDE =====
exports.updateStatus = async (req, res) => {
    try {
        const result = await repairService.updateStatus(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createByTech = async (req, res) => {
    try {

        const result = await repairService.createRepairByTech(req)

        res.json(result)

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}
// ===== GUEST =====
exports.createGuestRepair = async (req, res) => {
    try {
        const result = await repairService.createGuestRepair(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRecentCompletedRepairs = async (req, res) => {
    try {
        const result = await repairService.getRecentCompletedRepairs(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
/**
 * GET /user/repairs/summary?month=YYYY-MM
 */

exports.getSummary = async (req, res, next) => {
    try {
        const result = await repairService.getSummary(req);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
exports.updateDetail = async (req, res) => {
    try {
        const result = await repairService.updateDetail(req);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};