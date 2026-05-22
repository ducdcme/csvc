const db = require('../../infrastructure/database/connection');

module.exports = {

  // Checklist
  async getChecklistByZone(campus_id, zone_id) {
    const query = `
            SELECT 
                zsi.id AS item_id,
                zsi.item_name,
                zsi.ok_label AS ok_label,
                zsi.not_ok_label AS error_label,
                ist.name AS system_name
            FROM zone_system_items zsi
            JOIN zone_systems zs ON zsi.zone_system_id = zs.id
            JOIN inspection_system_types ist ON zs.inspection_system_type_id = ist.id
            WHERE zs.campus_id = $1
              AND zs.operation_zone_id = $2
            ORDER BY ist.display_order, zsi.display_order
        `;
    const result = await db.query(query, [campus_id, zone_id]);
    return result.rows;
  },

  // Get inspection by date
  async getInspectionByDate(campus_id, zone_id, date) {
    const res = await db.query(`
    SELECT *
    FROM daily_inspections
    WHERE campus_id = $1
      AND operation_zone_id = $2
      AND inspection_date = $3
    LIMIT 1
  `, [campus_id, zone_id, date]);

    return res.rows[0];
  },

  // Create inspection
  async createInspection(campus_id, zone_id, date) {
    const cal = await db.query(`
    SELECT is_working_day
    FROM calendar_days
    WHERE date = $1
  `, [date]);
    const isWorking = cal.rows[0]?.is_working_day ?? true;
    const res = await db.query(`
    INSERT INTO daily_inspections (
      campus_id,
      operation_zone_id,
      inspection_date,
      status,
      is_working_day
    )
    VALUES ($1, $2, $3, 'draft', $4)
    RETURNING *
  `, [campus_id, zone_id, date, isWorking]);

    return res.rows[0];
  },

  // Detail
  async getInspectionDetail(inspection_id) {

    const res = await db.query(`
    SELECT
      zsi.id AS item_id,
      zsi.item_name,
      zsi.display_order,

      ist.name AS system_name,
      ist.display_order AS system_display_order,

      zsi.ok_label,
      zsi.not_ok_label,

      dir.id AS result_id,
      dir.is_ok,
      dir.issue_note,
      f.id AS file_id,
      f.stored_path,
      di.status AS inspection_status,
      di.inspection_date,
      di.submitted_at,
      di.created_at,
      oz.name AS zone_name

    FROM daily_inspections di

    JOIN zone_systems zs
      ON zs.operation_zone_id = di.operation_zone_id

    JOIN inspection_system_types ist
      ON ist.id = zs.inspection_system_type_id

    JOIN zone_system_items zsi
      ON zsi.zone_system_id = zs.id

    LEFT JOIN daily_inspection_results dir
      ON dir.daily_inspection_id = di.id
      AND dir.zone_system_item_id = zsi.id

    LEFT JOIN daily_inspection_item_attachments dia
      ON dia.daily_inspection_result_id = dir.id

    LEFT JOIN files f
      ON f.id = dia.file_id
      
    LEFT JOIN operation_zones oz 
      ON oz.id = di.operation_zone_id

    WHERE di.id = $1

    ORDER BY
      ist.display_order,
      zsi.display_order
  `, [inspection_id]);

    return res.rows;
  },

  // Save result
  async saveInspectionResult(inspection_id, item_id, is_ok, issue_note) {
    const query = `
             INSERT INTO daily_inspection_results
        (
            daily_inspection_id,
            zone_system_item_id,
            is_ok,
            issue_note,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (daily_inspection_id, zone_system_item_id)
        DO UPDATE SET
            is_ok = EXCLUDED.is_ok,
            issue_note = EXCLUDED.issue_note,
            updated_at = NOW()
        RETURNING id
        `;
    const result = await db.query(query, [inspection_id, item_id, is_ok, issue_note]);
    return result;
  },

  // Attachment
  async insertAttachment(client, result_id, file_id) {
    await client.query(`
        INSERT INTO daily_inspection_item_attachments
        (daily_inspection_result_id, file_id)
        VALUES ($1, $2)
    `, [result_id, file_id]);
  },

  // Submit
  async submitInspection(client, inspection_id, user_id, note, late_reason) {

    await client.query(`
    UPDATE daily_inspections
    SET 
      status = 'submitted',
      submitted_by_user_id = $1,
      submitted_at = NOW(),
      note = $2,
      late_reason = $3,
      updated_at = NOW()
    WHERE id = $4
  `, [user_id, note, late_reason, inspection_id]);

  },

  // Log
  async insertInspectionLog(inspection_id, log_type) {
    const query = `
            INSERT INTO inspection_logs
            (daily_inspection_id, log_type, log_date, created_at)
            VALUES ($1, $2, CURRENT_DATE, NOW())
        `;
    await db.query(query, [inspection_id, log_type]);
  },
  // Lấy tất cả zone
  async getAllZones() {
    const query = `
        SELECT campus_id, id AS operation_zone_id
        FROM operation_zones
        WHERE is_active = true
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Insert log theo zone
  async insertInspectionLogByZone(campus_id, zone_id, inspection_id, log_type) {
    const query = `
        INSERT INTO inspection_logs
        (campus_id, operation_zone_id, daily_inspection_id, log_type, log_date, created_at)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, NOW())
    `;
    await db.query(query, [campus_id, zone_id, inspection_id, log_type]);
  },
  async getTodayWarnings(campus_id) {
    const query = `
        SELECT 
            oz.name AS zone_name,
            il.log_type
        FROM inspection_logs il
        JOIN operation_zones oz ON oz.id = il.operation_zone_id
        WHERE il.campus_id = $1
          AND il.log_date = CURRENT_DATE
          AND il.log_type IN ('missing', 'not_submitted')
    `;
    const result = await db.query(query, [campus_id]);
    return result.rows;
  },
  async getMonthlyReport(campus_id, month, year) {
    const query = `
        SELECT
            oz.name AS zone_name,
            ist.name AS system_name,
            di.inspection_date,
            CASE 
                WHEN BOOL_OR(dir.is_ok = false) THEN 'Fault'
                ELSE 'OK'
            END AS status
        FROM daily_inspections di
        JOIN daily_inspection_results dir ON dir.daily_inspection_id = di.id
        JOIN zone_system_items zsi ON zsi.id = dir.zone_system_item_id
        JOIN zone_systems zs ON zs.id = zsi.zone_system_id
        JOIN inspection_system_types ist ON ist.id = zs.inspection_system_type_id
        JOIN operation_zones oz ON oz.id = di.operation_zone_id
        WHERE di.campus_id = $1
          AND EXTRACT(MONTH FROM di.inspection_date) = $2
          AND EXTRACT(YEAR FROM di.inspection_date) = $3
        GROUP BY oz.name, ist.name, di.inspection_date
        ORDER BY di.inspection_date
    `;
    const result = await db.query(query, [campus_id, month, year]);
    return result.rows;
  },
  async getFaultDetail(inspection_id) {
    const query = `
        SELECT 
            ist.name AS system_name,
            zsi.item_name,
            dir.issue_note,
            f.stored_path
        FROM daily_inspection_results dir
        JOIN zone_system_items zsi ON zsi.id = dir.zone_system_item_id
        JOIN zone_systems zs ON zs.id = zsi.zone_system_id
        JOIN inspection_system_types ist ON ist.id = zs.inspection_system_type_id
        LEFT JOIN daily_inspection_item_attachments dia 
            ON dia.daily_inspection_result_id = dir.id
        LEFT JOIN files f ON f.id = dia.file_id
        WHERE dir.daily_inspection_id = $1
          AND dir.is_ok = false
    `;
    const result = await db.query(query, [inspection_id]);
    return result.rows;
  },
  async getZones(campus_id) {
    const query = `
        SELECT id, name
        FROM operation_zones
        WHERE campus_id = $1
          AND is_active = true
        ORDER BY name
    `;
    const result = await db.query(query, [campus_id]);
    return result.rows;
  },
  async getHistory(campus_id, from_date, to_date, zone_id, status) {
    const query = `
        SELECT 
            di.id,
            di.inspection_date,
            di.status,
            oz.name AS zone_name
        FROM daily_inspections di
        JOIN operation_zones oz ON oz.id = di.operation_zone_id
        WHERE di.campus_id = $1
        AND ($2::date IS NULL OR di.inspection_date >= $2)
        AND ($3::date IS NULL OR di.inspection_date <= $3)
        AND ($4::int IS NULL OR di.operation_zone_id = $4)
        AND ($5::text IS NULL OR di.status = $5)
        ORDER BY di.inspection_date DESC
    `;
    const result = await db.query(query, [
      campus_id,
      from_date || null,
      to_date || null,
      zone_id || null,
      status || null
    ]);
    return result.rows;
  },
  async getZonesStatusToday(campus_id) {
    const query = `
        SELECT 
            oz.id AS zone_id,
            oz.name AS zone_name,
            COALESCE(di.status, 'missing') AS status
        FROM operation_zones oz
        LEFT JOIN daily_inspections di 
            ON di.operation_zone_id = oz.id
            AND di.campus_id = oz.campus_id
            AND di.inspection_date = CURRENT_DATE
        WHERE oz.campus_id = $1
          AND oz.is_active = true
        ORDER BY oz.name
    `;
    const result = await db.query(query, [campus_id]);
    return result.rows;
  },
  async getDashboardSummary(campus_id) {
    const query = `
        SELECT 
            COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
            COUNT(*) FILTER (WHERE status = 'draft') AS not_submitted,
            COUNT(*) FILTER (WHERE status IS NULL) AS missing
        FROM (
            SELECT 
                oz.id,
                di.status
            FROM operation_zones oz
            LEFT JOIN daily_inspections di
                ON di.operation_zone_id = oz.id
                AND di.campus_id = oz.campus_id
                AND di.inspection_date = CURRENT_DATE
            WHERE oz.campus_id = $1
        ) t
    `;
    const result = await db.query(query, [campus_id]);
    return result.rows[0];
  },
  async getResultById(client, result_id) {
    const { rows } = await client.query(`
        SELECT 
            dir.id,
            di.campus_id AS campus_id   
        FROM daily_inspection_results dir
        JOIN daily_inspections di 
            ON di.id = dir.daily_inspection_id
        WHERE dir.id = $1
    `, [result_id]);

    return rows[0];
  },
  async countResults(inspection_id) {
    const { rows } = await db.query(`
        SELECT COUNT(*)::int AS count
        FROM daily_inspection_results
        WHERE daily_inspection_id = $1
    `, [inspection_id]);

    return rows[0].count;
  },
  async getChecklistItemsByInspection(inspection_id) {
    const { rows } = await db.query(`
        SELECT zsi.id AS item_id
        FROM daily_inspections di
        JOIN zone_systems zs ON zs.operation_zone_id = di.operation_zone_id
        JOIN zone_system_items zsi ON zsi.zone_system_id = zs.id
        WHERE di.id = $1
    `, [inspection_id]);

    return rows;
  },
  async insertEmptyResult(inspection_id, item_id) {
    await db.query(`
        INSERT INTO daily_inspection_results
        (daily_inspection_id, zone_system_item_id, is_ok, issue_note)
        VALUES ($1, $2, NULL, NULL)
        ON CONFLICT (daily_inspection_id, zone_system_item_id) DO NOTHING
    `, [inspection_id, item_id]);
  },
  async getResultsWithAttachment(inspection_id) {
    const { rows } = await db.query(`
        SELECT 
            zsi.item_name,
            dir.is_ok,
            dir.issue_note,
            COUNT(a.id) AS attachment_count
        FROM daily_inspection_results dir
        JOIN zone_system_items zsi 
            ON zsi.id = dir.zone_system_item_id
        LEFT JOIN daily_inspection_item_attachments a 
            ON a.daily_inspection_result_id = dir.id
        WHERE dir.daily_inspection_id = $1
        GROUP BY zsi.item_name, dir.is_ok, dir.issue_note
    `, [inspection_id]);

    return rows;
  },
  async validateInspection(inspection_id, zone_id) {
    const result = await db.query(`
  SELECT 
    zsi.id AS item_id,
    dir.id AS result_id,
    dir.is_ok,
    dir.issue_note,
    COUNT(a.id) AS attachment_count
  FROM zone_system_items zsi

  JOIN zone_systems zs 
    ON zs.id = zsi.zone_system_id

  LEFT JOIN daily_inspection_results dir
    ON dir.zone_system_item_id = zsi.id
    AND dir.daily_inspection_id = $1

  LEFT JOIN daily_inspection_item_attachments a
    ON a.daily_inspection_result_id = dir.id

  WHERE zs.operation_zone_id = $2  

  GROUP BY zsi.id, dir.id
`, [inspection_id, zone_id]);
    return result.rows;
  },
  async getInspectionById(inspection_id) {
    const result = await db.query(`
    SELECT *
    FROM daily_inspections
    WHERE id = $1 
  `, [inspection_id]);

    return result.rows[0];
  },
  async getFilesByResultId(result_id) {
    const result = await db.query(`
    SELECT 
      file_id
    FROM daily_inspection_item_attachments
    WHERE daily_inspection_result_id = $1
    ORDER BY created_at ASC
  `, [result_id]);

    return result.rows;
  },
  async attachFiles(client, result_id, fileIds) {

    for (const fid of fileIds) {

      await client.query(`
      INSERT INTO daily_inspection_item_attachments
      (daily_inspection_result_id, file_id)
      VALUES ($1,$2)
    `, [result_id, fid]);

      await client.query(`
      UPDATE files
      SET status = 'attached'
      WHERE id = $1
    `, [fid]);
    }
  },

  async isWorkingDay(date) {
    const res = await db.query(`
    SELECT is_working_day
    FROM calendar_days
    WHERE date = $1
  `, [date]);

    return res.rows[0]?.is_working_day ?? true;
  },
  // 3. get overdue
  async getOverdue(client, campus_id) {

    const res = await client.query(`
    SELECT 
      di.id,
      di.inspection_date,
      oz.name AS zone_name

    FROM daily_inspections di

    JOIN operation_zones oz
      ON oz.id = di.operation_zone_id

    WHERE di.campus_id = $1
      AND di.status != 'submitted'

      -- 🔥 chỉ lấy các ngày TRƯỚC hôm nay
      AND di.inspection_date < CURRENT_DATE

      -- 🔥 ngày làm việc
      AND di.is_working_day = true

      -- 🔥 quá hạn: sau 08:00 ngày hôm sau
      AND NOW() > (
        di.inspection_date 
        + INTERVAL '1 day' 
        + INTERVAL '8 hours'
      )

    ORDER BY di.inspection_date DESC
  `, [campus_id]);

    return res.rows;
  },
  // 4. mark overdue (cron)
  async markOverdue(start_date) {
    await db.query(`
    UPDATE daily_inspections di
    SET status = 'overdue'
    FROM calendar_days cd
    WHERE di.inspection_date = cd.date
      AND cd.is_working_day = TRUE
      AND di.status = 'draft'
      AND di.inspection_date >= $1
      AND NOW()::time > '19:00'
  `, [start_date]);
  },
  async reopenInspection(id) {
    await db.query(`
    UPDATE daily_inspections
    SET status = 'draft'
    WHERE id = $1
  `, [id]);
  },
  async attachFile(client, result_id, file_id) {

    await client.query(`
    INSERT INTO daily_inspection_item_attachments
    (daily_inspection_result_id, file_id)
    VALUES ($1,$2)
    ON CONFLICT DO NOTHING
  `, [result_id, file_id]);
  },
  async replaceFilesForResult(client, result_id, fileIds) {

    // 1. lấy file cũ
    const old = await client.query(`
    SELECT file_id
    FROM daily_inspection_item_attachments
    WHERE daily_inspection_result_id = $1
  `, [result_id]);

    const oldFileIds = old.rows.map(r => r.file_id);

    // 2. xoá mapping trước
    await client.query(`
    DELETE FROM daily_inspection_item_attachments
    WHERE daily_inspection_result_id = $1
  `, [result_id]);

    // 3. insert file mới
    for (const fid of fileIds) {
      await client.query(`
      INSERT INTO daily_inspection_item_attachments
      (daily_inspection_result_id, file_id)
      VALUES ($1,$2)
    `, [result_id, fid]);
    }

    // 4. chỉ xoá file KHÔNG còn được dùng ở đâu
    if (oldFileIds.length) {

      await client.query(`
      DELETE FROM files f
      WHERE f.id = ANY($1)
        AND f.status = 'pending'
        AND NOT EXISTS (
          SELECT 1
          FROM daily_inspection_item_attachments dia
          WHERE dia.file_id = f.id
        )
    `, [oldFileIds]);
    }
  },
  async upsertResult(client, inspection_id, item_id, is_ok, issue_note) {

    const check = await client.query(`
    SELECT id
    FROM daily_inspection_results
    WHERE daily_inspection_id = $1
      AND zone_system_item_id = $2
  `, [inspection_id, item_id]);

    if (check.rows.length) {

      const id = check.rows[0].id;

      await client.query(`
      UPDATE daily_inspection_results
      SET is_ok = $1,
        issue_note = $2,
        updated_at = NOW()
      WHERE id = $3
    `, [is_ok, issue_note, id]);

      return { id };
    }

    const res = await client.query(`
    INSERT INTO daily_inspection_results
    (daily_inspection_id, zone_system_item_id, is_ok, issue_note)
    VALUES ($1,$2,$3,$4)
    RETURNING id
  `, [inspection_id, item_id, is_ok, issue_note]);

    return res.rows[0];
  },
  async updateFilesToAttached(client, inspection_id) {

    await client.query(`
    UPDATE files
    SET status = 'attached'
    WHERE id IN (
      SELECT file_id
      FROM daily_inspection_item_attachments dia
      JOIN daily_inspection_results dir
        ON dir.id = dia.daily_inspection_result_id
      WHERE dir.daily_inspection_id = $1
    )
  `, [inspection_id]);
  },
  async updateStatus(client, inspection_id, status) {

    await client.query(`
    UPDATE daily_inspections
    SET status = $1
    WHERE id = $2
  `, [status, inspection_id]);
  },
  async getTodayInspections(client, campus_id) {

    const res = await client.query(`
    SELECT 
      di.id,
      di.operation_zone_id AS zone_id,
      di.status,
      di.submitted_at,

      COUNT(dir.id) FILTER (WHERE dir.id IS NOT NULL) AS done_items,
      COUNT(zsi.id) AS total_items

    FROM daily_inspections di

    JOIN zone_systems zs
      ON zs.operation_zone_id = di.operation_zone_id

    JOIN zone_system_items zsi
      ON zsi.zone_system_id = zs.id

    LEFT JOIN daily_inspection_results dir
      ON dir.daily_inspection_id = di.id
      AND dir.zone_system_item_id = zsi.id

    WHERE di.inspection_date = CURRENT_DATE
      AND di.campus_id = $1

    GROUP BY di.id
    ORDER BY di.operation_zone_id
  `, [campus_id]);

    return res.rows;
  },
  async getRecentCompleted(client, campus_id) {
    const res = await client.query(`
    SELECT 
      di.id,
      di.inspection_date,
      oz.name AS zone_name,
      di.submitted_at AS last_time

    FROM daily_inspections di

    JOIN operation_zones oz
      ON oz.id = di.operation_zone_id

    WHERE di.campus_id = $1
      AND di.status = 'submitted'   

    ORDER BY di.submitted_at DESC
    LIMIT 5
  `, [campus_id]);

    return res.rows;
  }
};


