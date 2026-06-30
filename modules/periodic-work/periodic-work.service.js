/**
 * Service layer
 * Xử lý toàn bộ business logic
 */

const db = require('../../infrastructure/database/connection');
const repo = require('./periodic-work.repository');
const repairService = require('../repair/repair.service');
const { getCurrentAcademicYear } = require('../../infrastructure/utils/academicYear');

// ================= JOBS =================

exports.getJobs = async (campusId, month) => {
    const { rows } = await repo.getJobsByMonth(campusId, month);
    return rows;
};

exports.getOverdueJobs = async (campusId) => {
    const { rows } = await repo.getOverdueJobs(campusId);
    return rows;
};
//JOB DETAIL
exports.getJobDetail = async (campusId, jobId) => {

    const { rows } =
        await repo.getJobById(jobId, campusId);

    const job = rows[0];

    if (!job) {
        throw new Error('Job not found');
    }

    const { rows: files } =
        await repo.getJobAttachments(jobId);

    return {
        ...job,

        attachments: files.filter(
            x => x.type === 'attachment'
        ),

        result_files: files.filter(
            x => x.type === 'result'
        )
    };
};
// ================= JOB ROOMS =================

/**
 * Get job rooms (WITH campus validation)
 */
exports.getJobRooms = async (campusId, jobId) => {
    // 1. Validate job thuộc campus
    const { rows: jobRows } = await repo.getJobById(jobId, campusId);
    const job = jobRows[0];

    if (!job) {
        throw new Error('Job not found or not belong to campus');
    }

    // 2. Get rooms
    const { rows } = await repo.getJobRooms(jobId);

    return rows;
};
// ================= SUBMIT ROOM =================
/**
 * Submit job room (WITH campus validation)
 */
exports.submitJobRoom = async (campusId, userId, jobRoomId, payload) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Lock job_room
        const { rows } = await repo.getJobRoomForUpdate(client, jobRoomId);
        const jobRoom = rows[0];

        if (!jobRoom) {
            throw new Error('Job room not found');
        }

        // 2. Validate campus (join job)
        const { rows: jobRows } = await repo.getJobById(jobRoom.job_id, campusId);
        const job = jobRows[0];

        if (!job) {
            throw new Error('Invalid campus access');
        }

        if (jobRoom.status === 'done') {
            throw new Error('Room already checked');
        }

        // 3. Update room
        await repo.updateJobRoom(client, jobRoomId, payload.note || null);

        // 4. Create repairs
        let repairCount = 0;
        if (payload.broken_items?.length) {
            for (const item of payload.broken_items) {
                await repairService.createRepair(client, {
                    campus_id: campusId,
                    room_id: jobRoom.room_id,
                    asset_type_id: item.asset_type_id,
                    issue_description: item.description,
                    attachments: []
                });
                repairCount++;
            }
        }

        // 5. Check job complete
        const res = await repo.countRemainingRooms(client, jobRoom.job_id);
        const remaining = parseInt(res.rows[0].count, 10);

        let jobCompleted = false;

        if (remaining === 0) {
            await repo.completeJob(client, jobRoom.job_id);
            jobCompleted = true;
        }

        await client.query('COMMIT');

        return {
            job_room_id: jobRoomId,
            repairs_created: repairCount,
            job_completed: jobCompleted
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};
// ================= COMPLETE JOB =================

/**
 * Complete job (WITH campus validation)
 */
exports.completeJob = async (campusId, userId, jobId) => {
    const client = await db.connect();

    try {
        // 1. Validate job
        const { rows } = await repo.getJobById(jobId, campusId);
        const job = rows[0];

        if (!job) {
            throw new Error('Job not found or not belong to campus');
        }

        // 2. Complete
        await repo.completeJob(client, jobId);

    } finally {
        client.release();
    }
};
// ================= SKIP =================

/**
 * Skip job (WITH campus validation)
 */
exports.skipJob = async (campusId, userId, jobId) => {
    // 1. Validate job
    const { rows } = await repo.getJobById(jobId, campusId);
    const job = rows[0];

    if (!job) {
        throw new Error('Job not found or not belong to campus');
    }

    // 2. Skip
    await repo.skipJob(jobId);
};
// ================= DASHBOARD =================

/**
 * Build dashboard data
 */
/**
 * Build dashboard data (refactored)
 */
exports.getDashboard = async (campusId) => {
    const { rows } = await repo.getDashboardData(campusId);

    const summary = {};
    const overdue = [];
    const pending = [];
    const done = [];

    for (const j of rows) {

        const type = j.type;

        // init summary dynamic
        if (!summary[type]) {
            summary[type] = {
                type_name: j.type_name,
                pending: 0,
                overdue: 0
            };
        }

        // OVERDUE
        if (j.overdue_days > 0) {
            summary[type].overdue++;

            overdue.push({
                id: j.id,
                type,
                type_name: j.type_name,
                title: j.title,
                due_date: j.due_date,
                overdue_days: j.overdue_days
            });

            continue;
        }

        // DONE
        if (j.status === 'done') {
            done.push({
                id: j.id,
                type,
                type_name: j.type_name,
                title: j.title,
                due_date: j.due_date
            });
            continue;
        }

        // PENDING
        summary[type].pending++;

        let progress = null;

        // chỉ inspection mới có progress
        if (type === 'inspection') {
            const res = await db.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'done') AS done,
          COUNT(*) AS total
        FROM periodic_job_rooms
        WHERE job_id = $1
      `, [j.id]);

            progress = {
                done: parseInt(res.rows[0].done),
                total: parseInt(res.rows[0].total)
            };
        }

        pending.push({
            id: j.id,
            type,
            type_name: j.type_name,
            title: j.title,
            due_date: j.due_date,
            progress
        });
    }

    return { summary, overdue, pending, done };
};
/**
 * Get job rooms tree (FINAL)
 */
/**
 * ============================================
 * BUILD TREE: Building → Floor → Room
 * - từ raw query
 * - tính progress từng cấp
 * ============================================
 */
exports.getJobRoomsTree = async (jobId) => {
    const academicYear = getCurrentAcademicYear()
    const { rows } = await repo.getJobRoomsTreeRaw(jobId, academicYear);

    const buildingMap = new Map();

    let totalRooms = 0;
    let doneRooms = 0;

    rows.forEach(row => {

        totalRooms++;
        if (row.is_done) doneRooms++;

        // ===== BUILDING =====
        if (!buildingMap.has(row.building_id)) {
            buildingMap.set(row.building_id, {
                id: row.building_id,
                name: row.building_name,
                progress: { done: 0, total: 0 },
                floors: new Map()
            });
        }

        const building = buildingMap.get(row.building_id);

        // ===== FLOOR =====
        if (!building.floors.has(row.floor_id)) {
            building.floors.set(row.floor_id, {
                id: row.floor_id,
                name: row.floor_name,
                progress: { done: 0, total: 0 },
                rooms: []
            });
        }

        const floor = building.floors.get(row.floor_id);

        // ===== ROOM =====
       const room = {

                job_room_id: row.job_room_id,

                room_id: row.room_id,

                room_code: row.room_code,

                room_name: row.room_name,

                status: row.is_done ? 'done' : 'pending',

                room_image_file_id: row.room_image_file_id,

                note: row.note,
                
                error_asset_ids: row.error_asset_ids || []
            };

        floor.rooms.push(room);

        // ===== PROGRESS =====
        floor.progress.total++;
        building.progress.total++;

        if (row.is_done) {
            floor.progress.done++;
            building.progress.done++;
        }
    });

    // ===== FORMAT FINAL =====
    const buildings = Array.from(buildingMap.values()).map(b => ({
        id: b.id,
        name: b.name,
        progress: b.progress,
        floors: Array.from(b.floors.values())
    }));

    return {
        summary: {
            total: totalRooms,
            done: doneRooms
        },
        buildings
    };
};
/**
 * Submit Operation
 */
exports.submitOperation = async (campusId, jobId, userId, payload) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const { note, attachments = [], no_file } = payload;

        // ===== VALIDATE =====
        if (!no_file && (!attachments || attachments.length === 0)) {
            throw new Error('Phải upload ít nhất 1 ảnh hoặc chọn "không có ảnh"');
        }

        // ===== UPDATE JOB =====
        await client.query(`
      UPDATE periodic_jobs
      SET 
        status = 'done',
        note = $1,
        completed_at = NOW()
      WHERE id = $2 AND campus_id = $3
    `, [note || null, jobId, campusId]);

        // ===== SAVE FILE =====
        for (const f of attachments) {
            await client.query(`
        INSERT INTO periodic_job_attachments (job_id, file_id, type)
        VALUES ($1, $2, 'attachment')
      `, [jobId, f.file_id]);
        }

        await client.query('COMMIT');

        return { success: true };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


/**
 * Submit Maintenance Job
 * - Validate requires_result_file
 * - Upload attachments + result_files
 * - Update job status
 */
exports.submitMaintenance = async (campusId, jobId, userId, payload) => {

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const {
            note,
            attachments = [],
            result_files = [],
            no_file
        } = payload;

        // ===== 1. LOAD JOB + REQUIRE RULE =====
        const jobRes = await client.query(`
      SELECT 
        j.id,
        d.requires_result_file
      FROM periodic_jobs j
      JOIN periodic_work_definitions d
        ON j.definition_id = d.id
      WHERE j.id = $1 AND j.campus_id = $2
      FOR UPDATE
    `, [jobId, campusId]);

        if (!jobRes.rows.length) {
            throw new Error('Job không tồn tại');
        }

        const job = jobRes.rows[0];

        // ===== 2. VALIDATE ẢNH =====
        if (!no_file && (!attachments || attachments.length === 0)) {
            throw new Error('Cần upload ảnh hoặc chọn "không có ảnh"');
        }

        // ===== 3. VALIDATE FILE KẾT QUẢ =====
        if (job.requires_result_file && (!result_files || result_files.length === 0)) {
            throw new Error('Công việc này yêu cầu file kết quả');
        }

        // ===== 4. UPDATE JOB =====
        await client.query(`
      UPDATE periodic_jobs
      SET 
        status = 'done',
        note = $1,
        completed_at = NOW()
      WHERE id = $2
    `, [note || null, jobId]);

        // ===== 5. INSERT ẢNH =====
        for (const f of attachments) {
            await client.query(`
        INSERT INTO periodic_job_attachments (job_id, file_id, type)
        VALUES ($1, $2, 'attachment')
      `, [jobId, f.file_id]);
        }

        // ===== 6. INSERT FILE KẾT QUẢ =====
        for (const f of result_files) {
            await client.query(`
        INSERT INTO periodic_job_attachments (job_id, file_id, type)
        VALUES ($1, $2, 'result')
      `, [jobId, f.file_id]);
        }

        await client.query('COMMIT');

        return {
            success: true
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;

    } finally {
        client.release();
    }
};
/**
 * DONE ROOM
 * - insert result
 * - update job_room
 */
exports.doneJobRoom = async (jobId, jobRoomId, payload, userId) => {

    // ===== 1. check job_room =====
    const { rows } = await repo.getJobRoomById(jobRoomId);
    const jobRoom = rows[0];

    if (!jobRoom) {
        throw new Error('Job room not found');
    }

    if (Number(jobRoom.job_id) !== Number(jobId)) {
        throw new Error('Job mismatch');
    }

    // ===== 2. insert result =====
    console.log('INSERT RESULT:', {
        jobRoomId,
        jobId
    });
    await repo.insertJobRoomResult({
        job_id: jobId,
        job_room_id: jobRoomId,
        room_id: jobRoom.room_id,

        note: payload.note || null,

        room_image_file_id: payload.room_image_file_id || null,

        error_asset_ids: payload.error_asset_ids || [],

        created_by: userId
    });


    // ===== 3. update job_room =====
    await repo.updateJobRoomDone(jobRoomId, userId);
    await exports.checkAndCompleteJob(jobId);
    return { success: true };
};
/**
 * ============================================
 * CHECK & COMPLETE JOB
 * ============================================
 */
exports.checkAndCompleteJob = async (jobId) => {

    const { rows } = await repo.countJobRoomProgress(jobId);

    const total = Number(rows[0].total);
    const done = Number(rows[0].done);

    console.log('JOB CHECK:', { jobId, total, done }); // debug

    if (total > 0 && done === total) {

        await repo.completeJobIfNeeded(jobId);

        return true;
    }

    return false;
};
/**
 * Lấy danh sách công việc theo tháng
 */
/**
 * Lấy checklist theo tháng (FINAL VERSION)
 * - Chuẩn hóa date range
 * - Không lệch timezone
 * - Map status rõ ràng
 * - Có progress cho inspection
 */
exports.getMonthlyJobs = async (campusId, monthStr) => {

    // =========================
    // 1. PARSE MONTH
    // =========================
    const now = new Date();

    let year, month;

    if (monthStr) {
        // format: YYYY-MM
        const parts = monthStr.split('-');

        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1; // JS month 0-based
    } else {
        year = now.getFullYear();
        month = now.getMonth();
    }

    // =========================
    // 2. DATE RANGE (QUAN TRỌNG)
    // =========================
    // tránh lỗi timezone → set giờ rõ ràng
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    // normalize today (không lệch giờ)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // =========================
    // 3. QUERY
    // =========================
    const jobs = await repo.getJobsByDateRange(campusId, start, end);

    // =========================
    // 4. MAP + STATUS
    // =========================
    const mapped = jobs.map(j => {

        const due = new Date(j.due_date);
        due.setHours(0, 0, 0, 0);

        let status = 'pending';

        if (j.status === 'done') {
            status = 'done';
        } else if (due < today) {
            status = 'overdue';
        }

        return {
            id: j.id,
            title: j.title,
            type: j.type,
            type_name: j.type_name,
            due_date: j.due_date,
            status,

            // progress (inspection)
            progress: j.progress_total
                ? {
                    total: parseInt(j.progress_total, 10),
                    done: parseInt(j.progress_done || 0, 10)
                }
                : null
        };
    });

    // =========================
    // 5. GROUP BY TYPE
    // =========================
    const groupMap = {};

    mapped.forEach(j => {
        if (!groupMap[j.type]) {
            groupMap[j.type] = {
                type: j.type,
                type_name: j.type_name,
                total: 0,
                items: []
            };
        }

        groupMap[j.type].items.push(j);
        groupMap[j.type].total++;
    });

    const groups = Object.values(groupMap);

    // =========================
    // 6. SUMMARY
    // =========================
    const summary = {
        total: mapped.length,
        done: 0,
        pending: 0,
        overdue: 0
    };

    mapped.forEach(j => {
        summary[j.status]++;
    });

    // =========================
    // 7. SORT (OPTIONAL NHƯNG NÊN CÓ)
    // =========================
    groups.forEach(g => {
        g.items.sort((a, b) => {
            // overdue lên đầu
            if (a.status === 'overdue' && b.status !== 'overdue') return -1;
            if (b.status === 'overdue' && a.status !== 'overdue') return 1;

            // pending tiếp
            if (a.status === 'pending' && b.status === 'done') return -1;
            if (b.status === 'pending' && a.status === 'done') return 1;

            // cuối cùng sort theo date
            return new Date(a.due_date) - new Date(b.due_date);
        });
    });

    // =========================
    // 8. RETURN
    // =========================
    return {
        summary,
        groups
    };
};