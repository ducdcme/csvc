/**
 * Repository layer
 * ONLY query DB, không chứa business logic
 */

const db = require('../../infrastructure/database/connection');

// ================= JOBS =================

/**
 * Get jobs by month (campus-based)
 */
exports.getJobsByMonth = async (campusId, month) => {
  const sql = `
    SELECT 
      j.id,
      j.type,
      j.status,
      j.due_date,
      d.title
    FROM periodic_jobs j
    JOIN periodic_work_definitions d ON d.id = j.definition_id
    WHERE j.campus_id = $1
      AND TO_CHAR(j.due_date, 'YYYY-MM') = $2
    ORDER BY j.due_date
  `;
  return db.query(sql, [campusId, month]);
};

/**
 * Get overdue jobs
 */
exports.getOverdueJobs = async (campusId) => {
  const sql = `
    SELECT 
      j.id,
      j.type,
      j.status,
      j.due_date,
      d.title
    FROM periodic_jobs j
    JOIN periodic_work_definitions d ON d.id = j.definition_id
    WHERE j.campus_id = $1
      AND j.status != 'done'
      AND j.due_date < DATE_TRUNC('month', CURRENT_DATE)
    ORDER BY j.due_date
  `;
  return db.query(sql, [campusId]);
};

/**
 * Get job + type info
 */
exports.getJobById = async (jobId, campusId) => {
  const sql = `
    SELECT 
      j.id,
      j.due_date,
      j.status,
      j.work_group
      i.work_type
      d.title as title,
      d.requires_result_file as requires_result_file,

      t.code AS type,
      t.name AS type_name

    FROM periodic_jobs j
    JOIN periodic_work_definitions d ON d.id = j.definition_id
    JOIN periodic_work_types t ON t.id = d.periodic_work_type_id

    WHERE j.id = $1
      AND j.campus_id = $2
  `;
  return db.query(sql, [jobId, campusId]);
};

// ================= JOB ROOMS =================

exports.getJobRooms = async (jobId) => {
  const sql = `
    SELECT 
      jr.id AS job_room_id,
      jr.room_id,
      jr.status,
      jr.checked_at,
      r.code AS room_code,
      r.name AS room_name,
      f.name AS floor_name,
      b.name AS building_name

    FROM periodic_job_rooms jr
    JOIN rooms r ON r.id = jr.room_id
    JOIN floors f ON f.id = r.floor_id
    JOIN buildings b ON b.id = r.building_id

    WHERE jr.job_id = $1
    ORDER BY b.name, f.name, r.name
  `;
  return db.query(sql, [jobId]);
};

exports.getJobRoomForUpdate = async (client, jobRoomId) => {
  const sql = `
    SELECT * FROM periodic_job_rooms
    WHERE id = $1
    FOR UPDATE
  `;
  return client.query(sql, [jobRoomId]);
};

exports.updateJobRoom = async (client, jobRoomId, note) => {
  const sql = `
    UPDATE periodic_job_rooms
    SET status = 'done',
        checked_at = NOW(),
        note = $2
    WHERE id = $1
  `;
  return client.query(sql, [jobRoomId, note]);
};

exports.countRemainingRooms = async (client, jobId) => {
  const sql = `
    SELECT COUNT(*) 
    FROM periodic_job_rooms
    WHERE job_id = $1 AND status != 'done'
  `;
  return client.query(sql, [jobId]);
};

// ================= JOB =================

exports.completeJob = async (client, jobId) => {
  const sql = `
    UPDATE periodic_jobs
    SET status = 'done',
        completed_at = NOW()
    WHERE id = $1
  `;
  return client.query(sql, [jobId]);
};

exports.skipJob = async (jobId) => {
  const sql = `
    UPDATE periodic_jobs
    SET status = 'skipped'
    WHERE id = $1
  `;
  return db.query(sql, [jobId]);
};

// ================= DASHBOARD =================

/**
 * Dashboard data
 */
/**
 * Dashboard data (refactored - using work_types)
 */
exports.getDashboardData = async (campusId) => {
  const sql = `
    SELECT 
      j.id,
      j.status,
      j.due_date,

      t.code AS type,
      t.name AS type_name,

      d.title,

      CASE 
        WHEN j.due_date < CURRENT_DATE AND j.status != 'done' AND j.status != 'skipped'
        THEN CURRENT_DATE - j.due_date
        ELSE 0
      END AS overdue_days

    FROM periodic_jobs j
    JOIN periodic_work_definitions d ON d.id = j.definition_id
    JOIN periodic_work_types t ON t.id = d.periodic_work_type_id

    WHERE j.campus_id = $1
    AND j.due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  `;
  return db.query(sql, [campusId]);
};
/**
 * Get job rooms raw data for tree
 */
/**
 * ============================================
 * GET JOB ROOMS TREE RAW
 * - Lấy dữ liệu phẳng để build tree
 * - Join result để xác định DONE
 * ============================================
 */
exports.getJobRoomsTreeRaw = async (jobId, academicYear) => {
  const sql = `
    SELECT
      -- JOB ROOM
      pjr.id AS job_room_id,
      pjr.job_id,
      pjr.room_id,

      -- ROOM
      r.code AS room_code,
      -- Ưu tiên lấy tên theo năm học, nếu không có (NULL) thì lấy tên gốc của phòng
      COALESCE(rny.room_name, r.name) AS room_name,

      -- FLOOR
      f.id AS floor_id,
      f.name AS floor_name,

      -- BUILDING
      b.id AS building_id,
      b.name AS building_name,

      -- RESULT (DONE CHECK)
      CASE 
        WHEN rrs.id IS NOT NULL THEN true
        ELSE false
      END AS is_done

    FROM periodic_job_rooms pjr

    INNER JOIN rooms r 
      ON r.id = pjr.room_id

    INNER JOIN floors f 
      ON f.id = r.floor_id

    INNER JOIN buildings b 
      ON b.id = r.building_id

    -- JOIN với bảng tên phòng theo năm học
    LEFT JOIN room_names_by_year rny
      ON rny.room_id = r.id 
      AND rny.academic_year = $2

    -- RESULT TABLE
    LEFT JOIN periodic_job_room_results rrs
      ON rrs.job_room_id = pjr.id

    WHERE pjr.job_id = $1

    ORDER BY 
      b.name ASC,
      f.name ASC,
      r.code ASC
  `;

  // Truyền cả 2 tham số: $1 là jobId, $2 là academicYear
  return db.query(sql, [jobId, academicYear]);
};
/**
 * Insert job room result (DONE ROOM)
 */
exports.insertJobRoomResult = async ({
  job_id,
  job_room_id,
  room_id,
  note,
  room_image_file_id,
  created_by
}) => {
  const sql = `
    INSERT INTO periodic_job_room_results
    (job_id, job_room_id, room_id, note, room_image_file_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  return db.query(sql, [
    job_id,
    job_room_id,
    room_id,
    note || null,
    room_image_file_id || null,
    created_by
  ]);
};


/**
 * Get job room by id
 */
exports.getJobRoomById = async (jobRoomId) => {
  const sql = `
    SELECT *
    FROM periodic_job_rooms
    WHERE id = $1
  `;
  return db.query(sql, [jobRoomId]);
};


/**
 * Mark job room done
 */
exports.updateJobRoomDone = async (jobRoomId, userId) => {
  const sql = `
    UPDATE periodic_job_rooms
    SET status = 'done',
        checked_at = NOW(),
        checked_by = $2
    WHERE id = $1
  `;
  return db.query(sql, [jobRoomId, userId]);
};
/**
 * ============================================
 * COUNT JOB ROOM PROGRESS
 * ============================================
 */
exports.countJobRoomProgress = async (jobId) => {

  const sql = `
    SELECT 
      COUNT(*) AS total,
      COUNT(r.job_room_id) AS done
    FROM periodic_job_rooms pjr
    LEFT JOIN periodic_job_room_results r
      ON r.job_room_id = pjr.id
    WHERE pjr.job_id = $1
  `;

  return db.query(sql, [jobId]);
};


/**
 * ============================================
 * UPDATE JOB → DONE
 * ============================================
 */
exports.completeJobIfNeeded = async (jobId) => {

  const sql = `
    UPDATE periodic_jobs
    SET status = 'done',
        completed_at = NOW()
    WHERE id = $1
      AND status != 'done'
  `;

  return db.query(sql, [jobId]);
};
/**
 * Lấy job theo khoảng thời gian
 */
/**
 * Lấy job theo tháng (chuẩn schema hiện tại)
 * - JOIN definition để lấy title
 * - JOIN type để lấy type + type_name
 * - JOIN room để lấy progress (optional nhưng nên có)
 */
exports.getJobsByDateRange = async (campusId, start, end) => {

  const query = `
    SELECT 
      j.id,
      j.due_date,
      j.status,

      d.title,

      t.code AS type,
      t.name AS type_name,

      -- progress (inspection)
      r.total AS progress_total,
      r.done AS progress_done

    FROM periodic_jobs j

    JOIN periodic_work_definitions d 
      ON j.definition_id = d.id

    JOIN periodic_work_types t 
      ON d.periodic_work_type_id = t.id

    LEFT JOIN (
      SELECT 
        job_id,
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'done' THEN 1 END) AS done
      FROM periodic_job_rooms
      GROUP BY job_id
    ) r ON r.job_id = j.id

    WHERE j.campus_id = $1
      AND j.due_date BETWEEN $2 AND $3

    ORDER BY j.due_date ASC
  `;

  const values = [campusId, start, end];

  const result = await db.query(query, values);

  return result.rows;
};