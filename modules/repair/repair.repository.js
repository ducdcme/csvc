const db = require('../../infrastructure/database/connection');

// ===== LIST =====
exports.getRepairs = async (campusId) => {
  const sql = `
    SELECT 
      rr.id,
      rr.created_at,
      rr.status,
      COALESCE(rnby.room_name, r.name) AS room_name,
      r.code AS room_code,
      at.name AS asset_type_name,
      rr.issue_description,
      rr.reporter_label,
      rr.result_note,
      rr.quantity,
      ra.file_id as file_id
    FROM repair_reports rr
    JOIN rooms r ON rr.room_id = r.id
    LEFT JOIN room_names_by_year rnby ON r.id = rnby.room_id
    LEFT JOIN repair_attachments ra ON rr.id = ra.repair_report_id
    JOIN asset_types at ON rr.asset_type_id = at.id
    WHERE rr.campus_id = $1
    ORDER BY rr.created_at DESC
  `;
  const result = await db.query(sql, [campusId]);
  return result.rows;
};

exports.countRepairs = async (campusId) => {
  const sql = `
    SELECT COUNT(*) 
    FROM repair_reports
    WHERE campus_id = $1
  `;
  const result = await db.query(sql, [campusId]);
  return result.rows[0].count;
};

// ===== DETAIL =====
exports.getRepairDetail = async (campusId, repairId) => {
  const sql = `
    SELECT 
      rr.id,
      rr.issue_description,
      rr.status,
      rr.result_note,
      rr.created_at,
      rr.received_at,
      rr.in_progress_at,
      rr.completed_at,
      rr.reporter_label,
      u.full_name AS received_by_name,
      r.name AS room_name,
      r.code AS room_code,
      f.name AS floor_name,
      b.name AS building_name,
      at.name AS asset_type_name
    FROM repair_reports rr
    LEFT JOIN users u ON rr.received_by_user_id = u.id
    JOIN rooms r ON rr.room_id = r.id
    JOIN floors f ON r.floor_id = f.id
    JOIN buildings b ON r.building_id = b.id
    JOIN asset_types at ON rr.asset_type_id = at.id
    WHERE rr.id = $1
      AND rr.campus_id = $2
  `;
  const result = await db.query(sql, [repairId, campusId]);
  return result.rows[0];
};

// ===== ATTACHMENTS =====
exports.getRepairAttachments = async (campusId, repairId) => {
  const sql = `
    SELECT 
      f.id AS file_id,
      f.original_filename,
      f.stored_path,
      ra.attachment_type
    FROM repair_attachments ra
    JOIN files f ON ra.file_id = f.id
    JOIN repair_reports rr ON rr.id = ra.repair_report_id
    WHERE rr.campus_id = $1
      AND ra.repair_report_id = $2
  `;
  const result = await db.query(sql, [campusId, repairId]);
  return result.rows;
};

// ===== LOGS =====
exports.getRepairLogs = async (campusId, repairId) => {
  const sql = `
    SELECT 
      rsl.from_status,
      rsl.to_status,
      rsl.action_note,
      rsl.acted_by_user_id,
      u.full_name AS acted_by_name,
      rsl.acted_at
    FROM repair_status_logs rsl
    LEFT JOIN users u ON rsl.acted_by_user_id = u.id
    JOIN repair_reports rr ON rr.id = rsl.repair_report_id
    WHERE rr.campus_id = $1
      AND rsl.repair_report_id = $2
    ORDER BY rsl.acted_at ASC
  `;
  const result = await db.query(sql, [campusId, repairId]);
  return result.rows;
};

// ===== LOCK =====
exports.getRepairById = async (client, campusId, repairId) => {
  const sql = `
    SELECT *
    FROM repair_reports
    WHERE id = $1
      AND campus_id = $2
    FOR UPDATE
  `;
  const result = await client.query(sql, [repairId, campusId]);
  return result.rows[0];
};

// ===== UPDATE STATUS =====
exports.updateStatus = async (client, repairId, campusId, status, userId) => {
  const sql = `
    UPDATE repair_reports
    SET status = $1,
        received_by_user_id = $2,
        received_at = NOW(),
        updated_at = NOW()
    WHERE id = $3
      AND campus_id = $4
  `;
  await client.query(sql, [status, userId, repairId, campusId]);
};

// ===== COMPLETE =====
exports.completeRepair = async (client, repairId, campusId, resultNote) => {
  const sql = `
    UPDATE repair_reports
    SET status = 'hoan_thanh',
        result_note = $1,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = $2
      AND campus_id = $3
  `;
  await client.query(sql, [resultNote, repairId, campusId]);
};

// ===== OVERRIDE =====
exports.overrideStatus = async (client, repairId, campusId, status, note) => {
  const sql = `
    UPDATE repair_reports
    SET status = $1,
        result_note = COALESCE($2, result_note),
        updated_at = NOW()
    WHERE id = $3
      AND campus_id = $4
  `;
  await client.query(sql, [status, note, repairId, campusId]);
};

// ===== LOG =====
exports.insertStatusLog = async (client, repairId, fromStatus, toStatus, userId, note) => {
  const sql = `
    INSERT INTO repair_status_logs
    (repair_report_id, from_status, to_status, action_note, acted_by_user_id, acted_at, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
  `;
  await client.query(sql, [repairId, fromStatus, toStatus, note || null, userId]);
};

// ===== ATTACHMENT =====
exports.insertAttachment = async (client, repairId, fileId) => {
  const sql = `
    INSERT INTO repair_attachments
    (repair_report_id, file_id, attachment_type, created_at)
    VALUES ($1, $2, 'repair_result_image', NOW())
  `;
  await client.query(sql, [repairId, fileId]);
};

exports.insertReportAttachment = async (client, repairId, fileId) => {
  const sql = `
    INSERT INTO repair_attachments
    (repair_report_id, file_id, attachment_type, created_at)
    VALUES ($1, $2, 'report_image', NOW())
  `;
  await client.query(sql, [repairId, fileId]);
};
exports.insertRepair = async (client, data) => {

  const sql = `
        INSERT INTO repair_reports (
            campus_id,
            room_id,
            asset_type_id,
            issue_description,
            quantity,
            report_source,
            created_by_user_id,
            status,
            created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,'cho_tiep_nhan',NOW())
        RETURNING id
    `

  const result = await client.query(sql, [
    data.campus_id,
    data.room_id,
    data.asset_type_id,
    data.issue_description,
    data.quantity,
    data.rp_source,
    data.created_by_user_id
  ])

  return result.rows[0].id
}
// ===== GUEST CREATE =====
exports.insertGuestRepair = async (client, campusId, roomId, assetTypeId, issueDescription, quantity) => {
  const sql = `
    INSERT INTO repair_reports
    (campus_id, room_id, asset_type_id, report_source, reporter_label,
     issue_description,status,quantity, created_at, updated_at)
    VALUES ($1, $2, $3, 'guest', 'Giáo viên', $4, 'cho_tiep_nhan',$5, NOW(), NOW())
    RETURNING id
  `;
  const result = await client.query(sql, [campusId, roomId, assetTypeId, issueDescription, quantity]);
  return result.rows[0].id;
};

// ===== PUBLIC COMPLETED =====
exports.getRecentCompletedRepairs = async (campusId) => {
  const sql = `
    SELECT 
    r.id,
    r.status,
    r.created_at,

    rm.code AS room_code,
    rm.name AS room_name,

    at.name AS asset_type_name

FROM repair_reports r
JOIN rooms rm ON r.room_id = rm.id
JOIN asset_types at ON r.asset_type_id = at.id

WHERE r.campus_id = $1

ORDER BY r.created_at DESC
LIMIT 10
  `;
  const result = await db.query(sql, [campusId]);
  return result.rows;
};
/**
 * GET SUMMARY GROUP BY STATUS
 */
exports.getSummary = async (campusId, month) => {
  const sql = `
    SELECT
      COUNT(*) AS total,

      COUNT(*) FILTER (WHERE status = 'cho_tiep_nhan') AS pending,

      COUNT(*) FILTER (
        WHERE status IN ('da_tiep_nhan', 'dang_xu_ly')
      ) AS processing,

      COUNT(*) FILTER (WHERE status = 'hoan_thanh') AS done

    FROM repair_reports
    WHERE campus_id = $1
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', TO_DATE($2, 'YYYY-MM'));
  `;

  const result = await db.query(sql, [campusId, month]);
  return result.rows[0];
};
/**
 * UPDATE DETAIL (NOTE ONLY)
 */
exports.updateDetail = async (client, repairId, campusId, resultNote) => {

  const sql = `
        UPDATE repair_reports
        SET result_note = COALESCE($1, result_note),
            updated_at = NOW()
        WHERE id = $2
          AND campus_id = $3
    `;

  await client.query(sql, [resultNote, repairId, campusId]);
};