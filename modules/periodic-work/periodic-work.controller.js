/**
 * Controller layer
 * Only handles request/response, no business logic here
 */

const service = require('./periodic-work.service');

exports.getJobs = async (req, res) => {
    const campusId = req.session.campus_id;
    const { month } = req.query;

    const data = await service.getJobs(campusId, month);

    res.json({ success: true, data, pagination: null });
};

exports.getOverdueJobs = async (req, res) => {
    const campusId = req.session.campus_id;

    const data = await service.getOverdueJobs(campusId);

    res.json({ success: true, data, pagination: null });
};

exports.getJobDetail = async (req, res) => {
    const campusId = req.session.campus_id;
    const { id } = req.params;

    const data = await service.getJobDetail(campusId, id);

    res.json({ success: true, data, pagination: null });
};

exports.getJobRooms = async (req, res) => {
    const campusId = req.session.campus_id;
    const { id } = req.params;

    const data = await service.getJobRooms(campusId, id);

    res.json({ success: true, data, pagination: null });
};

exports.submitJobRoom = async (req, res) => {
    const campusId = req.session.campus_id;
    const userId = req.session.user?.id;

    const { id } = req.params;
    const payload = req.body;

    const data = await service.submitJobRoom(campusId, userId, id, payload);

    res.json({ success: true, message: 'Submitted', data });
};

exports.completeJob = async (req, res) => {
    const campusId = req.session.campus_id;
    const userId = req.session.user?.id;

    const { id } = req.params;
    const payload = req.body;

    await service.completeJob(campusId, userId, id, payload);

    res.json({ success: true, message: 'Completed', data: null });
};

exports.skipJob = async (req, res) => {
    const campusId = req.session.campus_id;
    const userId = req.session.user?.id;

    const { id } = req.params;

    await service.skipJob(campusId, userId, id);

    res.json({ success: true, message: 'Skipped', data: null });
};

exports.getDashboard = async (req, res) => {
    const campusId = req.session.campus_id;

    const data = await service.getDashboard(campusId);

    res.json({ success: true, data, pagination: null });
};
/**
 * GET /user/periodic-work/jobs/:id/rooms-tree
 */
/**
 * GET /jobs/:id/rooms-tree
 */
exports.getJobRoomsTree = async (req, res, next) => {
    try {

        const jobId = req.params.id;
        const campusId = req.user.campus_id;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: 'jobId không hợp lệ'
            });
        }

        const data = await service.getJobRoomsTree(jobId, campusId);

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
    }
};
/**
 * Submit Operation Job
 */
exports.submitOperation = async (req, res, next) => {
    try {
        const campusId = req.session.campus_id;
        const jobId = req.params.id;
        const userId = req.session.user.id;

        const result = await service.submitOperation(
            campusId,
            jobId,
            userId,
            req.body
        );

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Submit Maintenance Job
 */
exports.submitMaintenance = async (req, res, next) => {
    try {
        const campusId = req.session.campus_id;
        const jobId = req.params.id;
        const userId = req.session.user.id;

        const result = await service.submitMaintenance(
            campusId,
            jobId,
            userId,
            req.body
        );

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        next(err);
    }
};
/**
 * POST /jobs/:jobId/rooms/:jobRoomId/done
 */
exports.doneJobRoom = async (req, res, next) => {
    try {

        const jobId = Number(req.params.jobId);
        const jobRoomId = Number(req.params.jobRoomId);
        const userId = req.user.id;

        if (!jobId || !jobRoomId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid params'
            });
        }

        const data = await service.doneJobRoom(
            jobId,
            jobRoomId,
            req.body,
            userId
        );

        return res.json({
            success: true,
            data
        });

    } catch (err) {
        next(err);
        message(err.message)
    }
};
/**
 * GET /user/periodic-work/monthly
 * Lấy toàn bộ checklist trong tháng
 */
exports.getMonthly = async (req, res) => {
    try {
        const campusId = req.session.campus_id;
        // Có thể truyền ?month=YYYY-MM
        const { month } = req.query;

        const data = await service.getMonthlyJobs(campusId, month);

        return res.json({
            success: true,
            message: 'Monthly checklist',
            data
        });

    } catch (err) {
        console.error('getMonthly error:', err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};