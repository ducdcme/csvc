const db = require('../../infrastructure/database/connection');

exports.getInspectionHealth = async (campusId) => {

    return db.query(`
    
        SELECT 
            oz.id,
            oz.name,
            di.status

        FROM operation_zones oz

        LEFT JOIN daily_inspections di
            ON di.operation_zone_id = oz.id
            AND di.campus_id = oz.campus_id
            AND di.inspection_date = CURRENT_DATE - INTERVAL '1 day'

        WHERE oz.campus_id = $1
          AND oz.is_active = true

        ORDER BY oz.name

    `, [campusId])
}
exports.getCalendarDay = async (date) => {

    return db.query(`
    
        SELECT
            date,
            is_working_day,
            note

        FROM calendar_days

        WHERE date = $1

        LIMIT 1

    `, [date])
}
exports.getRepairSummary = async (campusId) => {

    return db.query(`
    
        SELECT
            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE status = 'cho_tiep_nhan'
            ) AS pending,

            COUNT(*) FILTER (
                WHERE status IN (
                    'da_tiep_nhan',
                    'dang_xu_ly'
                )
            ) AS processing,

            COUNT(*) FILTER (
                WHERE status = 'hoan_thanh'
            ) AS done

        FROM repair_reports

        WHERE campus_id = $1
          AND DATE_TRUNC('month', created_at)
            = DATE_TRUNC('month', CURRENT_DATE)

    `, [campusId])
}
exports.getPeriodicSummary = async (campusId) => {

    return db.query(`
    
        SELECT
            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE status != 'done'
            ) AS pending,

            COUNT(*) FILTER (
                WHERE due_date < CURRENT_DATE
                  AND status != 'done'
            ) AS overdue,

            COUNT(*) FILTER (
                WHERE status = 'done'
            ) AS done

        FROM periodic_jobs

        WHERE campus_id = $1
          AND DATE_TRUNC('month', due_date)
            = DATE_TRUNC('month', CURRENT_DATE)

    `, [campusId])
}
exports.getIncidentSummary = async (campusId) => {

    return db.query(`
    
        SELECT
            COUNT(*) AS total,

            COUNT(*) FILTER (
                WHERE status = 'OPEN'
            ) AS pending,

            COUNT(*) FILTER (
                WHERE status IN (
                    'PLANNING',
                    'IN_PROGRESS',
                    'REVIEWING'
                )
            ) AS processing,

            COUNT(*) FILTER (
                WHERE status = 'CLOSED'
            ) AS done

        FROM incident_works

        WHERE campus_id = $1
          AND DATE_TRUNC('month', created_at)
            = DATE_TRUNC('month', CURRENT_DATE)

    `, [campusId])
}
exports.getPeriodicTasks = async (campusId) => {

    return db.query(`
    
        SELECT
            j.id,
            j.status,
            j.due_date,

            d.title,

            t.code AS type_code

        FROM periodic_jobs j

        JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        JOIN periodic_work_types t
            ON t.id = d.periodic_work_type_id

        WHERE j.campus_id = $1
          AND j.status != 'done' 
          AND j.status !='skipped'
          AND j.due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        ORDER BY j.due_date ASC

    `, [campusId])
}
exports.getIncidentTasks = async (campusId) => {

    return db.query(`
    
        SELECT
            id,
            title,
            status,
            created_at,
            due_date

        FROM incident_works

        WHERE campus_id = $1
          AND status != 'CLOSED'
          AND due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        ORDER BY created_at DESC

    `, [campusId])
}
exports.getRecentRepairCompleted = async (campusId) => {

    return db.query(`
    
        SELECT
            rr.id,
            rr.completed_at,
            COALESCE(rnby.room_name, r.name) AS room_name,
            r.code AS room_code,
            at.name AS asset_type_name

        FROM repair_reports rr
        JOIN rooms r ON r.id = rr.room_id
        LEFT JOIN room_names_by_year rnby
            ON rnby.room_id = r.id
            AND rnby.academic_year = '2025-2026'
        
        LEFT JOIN asset_types at ON at.id = rr.asset_type_id

        WHERE rr.campus_id = $1
          AND rr.status = 'hoan_thanh'

        ORDER BY completed_at DESC

        LIMIT 5

    `, [campusId])
}
exports.getRecentPeriodicCompleted = async (campusId) => {

    return db.query(`
    
        SELECT
            j.id,
            d.title,
            j.completed_at

        FROM periodic_jobs j

        JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        WHERE j.campus_id = $1
          AND j.status = 'done'

        ORDER BY j.completed_at DESC

        LIMIT 5

    `, [campusId])
}
exports.getRecentIncidentCompleted = async (campusId) => {

    return db.query(`
    
        SELECT
            id,
            title,
            updated_at

        FROM incident_works

        WHERE campus_id = $1
          AND status = 'CLOSED'

        ORDER BY updated_at DESC

        LIMIT 5

    `, [campusId])
}
exports.getSummerWorkDashboard = async (
    campusId,
    year
) => {

    const sql = `

        -- ================= PERIODIC =================
        SELECT
            'PERIODIC' AS source,

            j.id,

            d.title,

            j.status,
            d.first_due_date as start_date,
            j.due_date,
           
            j.completed_at,

            j.work_group,
            j.work_type,

            c.name AS contractor_name

        FROM periodic_jobs j

        INNER JOIN periodic_work_definitions d
            ON d.id = j.definition_id

        LEFT JOIN contractors c
            ON c.id = j.contractor_id

        WHERE j.campus_id = $1
          AND d.cycle_value = 12
          AND EXTRACT(
                YEAR FROM j.due_date
              ) = $2



        UNION ALL



        -- ================= INCIDENT =================
        SELECT
            'INCIDENT' AS source,

            i.id,

            i.title,

            i.status,
            i.start_date,
            i.due_date,
            i.completed_at,

            i.work_group,
            i.work_type,

            c.name AS contractor_name

        FROM incident_works i

        LEFT JOIN contractors c
            ON c.id = i.contractor_id

        WHERE i.campus_id = $1
          AND i.work_type IS NOT NULL
          AND EXTRACT(
                YEAR FROM i.due_date
              ) = $2

        ORDER BY due_date ASC

    `

    return db.query(sql, [
        campusId,
        year
    ])

}
