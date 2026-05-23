// Service: Repair business logic

const repairRepo = require('./repair.repository');
const db = require('../../infrastructure/database/connection');

// ===== LIST =====
exports.getRepairs = async (req) => {
    const campusId = req.user.campus_id;

    const data = await repairRepo.getRepairs(campusId);
    const total = await repairRepo.countRepairs(campusId);

    return {
        success: true,
        message: "OK",
        data: data,
        pagination: {
            total: parseInt(total)
        }
    };
};

// ===== DETAIL =====
exports.getRepairDetail = async (req) => {
    const campusId = req.user.campus_id;
    const repairId = req.params.id;

    const detail = await repairRepo.getRepairDetail(campusId, repairId);
    const attachments = await repairRepo.getRepairAttachments(campusId, repairId);
    const logs = await repairRepo.getRepairLogs(campusId, repairId);

    detail.attachments = attachments;
    detail.logs = logs;

    return {
        success: true,
        message: "OK",
        data: detail,
        pagination: null
    };
};

// ===== TECH RECEIVE =====
exports.receiveRepair = async (req) => {
    const campusId = req.user.campus_id;
    const userId = req.user.id;
    const repairId = req.params.id;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const repair = await repairRepo.getRepairById(client, campusId, repairId);
        if (!repair) {
            throw new Error('Repair not found')
        }
        if (repair.assigned_to) {
            throw new Error('Already assigned')
        }
        if (repair.status !== 'cho_tiep_nhan') {
            throw new Error('Invalid status');
        }

        await repairRepo.updateStatus(client, repairId, campusId, 'da_tiep_nhan', userId);
        await repairRepo.insertStatusLog(client, repairId, 'cho_tiep_nhan', 'da_tiep_nhan', userId);

        await client.query('COMMIT');

        return {
            success: true, message: "Received", data: {
                id: repairId,
                status: 'da_tiep_nhan'
            }, pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ===== TECH START =====
exports.startRepair = async (req) => {
    const campusId = req.user.campus_id;
    const userId = req.user.id;
    const repairId = req.params.id;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const repair = await repairRepo.getRepairById(client, campusId, repairId);
        if (!repair) {
            throw new Error('Repair not found')
        }
        if (repair.status !== 'da_tiep_nhan') {
            throw new Error('Invalid status');
        }

        await repairRepo.updateStatus(client, repairId, campusId, 'dang_xu_ly', userId);
        await repairRepo.insertStatusLog(client, repairId, 'da_tiep_nhan', 'dang_xu_ly', userId);

        await client.query('COMMIT');

        return {
            success: true, message: "Started", data: {
                id: repairId,
                status: 'dang_xu_ly'
            }, pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ===== TECH COMPLETE =====
exports.completeRepair = async (req) => {
    const campusId = req.user.campus_id;
    const userId = req.user.id;
    const repairId = req.params.id;
    const { result_note, attachments } = req.body || {};

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const repair = await repairRepo.getRepairById(client, campusId, repairId);
        if (!repair) {
            throw new Error('Repair not found')
        }
        if (repair.status !== 'dang_xu_ly') {
            throw new Error('Invalid status');
        }

        await repairRepo.completeRepair(client, repairId, campusId, result_note);
        await repairRepo.insertStatusLog(client, repairId, 'dang_xu_ly', 'hoan_thanh', userId);

        if (attachments && attachments.length > 0) {
            for (const item of attachments) {

                const fileId = item.file_id;

                await repairRepo.insertAttachment(client, repairId, fileId);
            }
        }

        await client.query('COMMIT');

        return {
            success: true, message: "Completed", data: {
                id: repairId,
                status: 'hoan_thanh'
            }, pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ===== SUPERVISOR OVERRIDE =====
exports.updateStatus = async (req) => {
    const campusId = req.user.campus_id;
    const userId = req.user.id;
    const repairId = req.params.id;
    const { status, note } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const repair = await repairRepo.getRepairById(client, campusId, repairId);
        const oldStatus = repair.status;

        await repairRepo.overrideStatus(client, repairId, campusId, status, note);
        await repairRepo.insertStatusLog(client, repairId, oldStatus, status, userId);

        await client.query('COMMIT');

        return {
            success: true,
            message: "Status updated",
            data: { id: repairId, old_status: oldStatus, new_status: status },
            pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
//Tech Create Repair
exports.createRepairByTech = async (req) => {

    const campusId = req.user.campus_id
    const userId = req.user.id

    const {
        room_id,
        asset_type_id,
        issue_description,
        quantity,
        rp_source,
        attachments
    } = req.body

    const client = await db.connect()

    try {

        await client.query('BEGIN')

        // 🔥 VALIDATE
        if (!room_id) throw new Error('room_id required')
        if (!issue_description) throw new Error('issue_description required')

        // 🔥 CREATE REPORT
        const repairId = await repairRepo.insertRepair(client, {
            campus_id: campusId,
            room_id,
            asset_type_id,
            issue_description,
            quantity,
            rp_source, // 🔥 chuẩn hóa
            created_by_user_id: userId
        })

        // 🔥 ATTACHMENTS
        if (attachments && attachments.length > 0) {

            for (const item of attachments) {

                await repairRepo.insertAttachment(
                    client,
                    repairId,
                    item.file_id
                )
            }
        }

        // 🔥 STATUS LOG (OPTION – nếu bạn đang dùng)
        await repairRepo.insertStatusLog(
            client,
            repairId,
            null,
            'cho_tiep_nhan',
            userId
        )

        await client.query('COMMIT')

        return {
            success: true,
            message: 'Created',
            data: {
                id: repairId,
                status: 'cho_tiep_nhan'
            },
            pagination: null
        }

    } catch (err) {

        await client.query('ROLLBACK')
        throw err

    } finally {
        client.release()
    }
}
// ===== GUEST CREATE =====
exports.createGuestRepair = async (req) => {
    const { room_id, asset_type_id, issue_description, attachments, quantity } = req.body;
    const campus_id = req.campus_id;
    if (!campus_id) {
        throw new Error('Campus not selected');
    }
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const repairId = await repairRepo.insertGuestRepair(
            client,
            campus_id,
            room_id,
            asset_type_id,
            issue_description,
            quantity
        );

        if (attachments && attachments.length) {

            for (const item of attachments) {

                const fileId = item.file_id; // 🔥 FIX

                if (!fileId) continue;

                await repairRepo.insertReportAttachment(
                    client,
                    repairId,
                    fileId
                );
            }
        }

        await repairRepo.insertStatusLog(client, repairId, null, 'cho_tiep_nhan', null);

        await client.query('COMMIT');

        return {
            success: true,
            message: "Repair created",
            data: { id: repairId },
            pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// ===== GUEST VIEW COMPLETED =====
exports.getRecentCompletedRepairs = async (req) => {
    const campusId = req.campus_id;
    const data = await repairRepo.getRecentCompletedRepairs(campusId);

    return { success: true, message: "OK", data: data, pagination: null };
};
/**
 * GET SUMMARY BY MONTH
 */
exports.getSummary = async (req) => {
    const campusId = req.campus_id;
    const month = req.query.month || new Date();

    const data = await repairRepo.getSummary(campusId, month);

    return {
        success: true,
        message: "OK",
        data: {
            total: Number(data.total),
            pending: Number(data.pending),
            processing: Number(data.processing),
            done: Number(data.done)
        },
        pagination: null
    };
};
/**
 * UPDATE DETAIL AFTER COMPLETED
 */
exports.updateDetail = async (req) => {

    const campusId = req.user.campus_id;
    const userId = req.user.id;
    const repairId = req.params.id;
    const { result_note, attachments } = req.body;

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const repair = await repairRepo.getRepairById(client, campusId, repairId);

        if (!repair) {
            throw new Error('Repair not found');
        }

        if (repair.status !== 'hoan_thanh') {
            throw new Error('Only completed repair can update detail');
        }

        // update note (không đổi status)
        await repairRepo.updateDetail(client, repairId, campusId, result_note);

        // insert attachments nếu có
        if (attachments && attachments.length > 0) {
            for (const fileId of attachments) {
                await repairRepo.insertAttachment(client, repairId, fileId);
            }
        }

        // log (optional nhưng nên có)
        await repairRepo.insertStatusLog(
            client,
            repairId,
            'hoan_thanh',
            'hoan_thanh',
            userId,
            'Update detail'
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: "Detail updated",
            data: {
                id: repairId,
                status: 'hoan_thanh'
            },
            pagination: null
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};