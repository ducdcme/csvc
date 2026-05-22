const repo = require('./dashboard.repository')

// ============================================
// HEALTH
// ============================================

exports.getHealth = async (campusId) => {
    // ========================================
    // YESTERDAY
    // ========================================

    const yesterday = new Date()

    yesterday.setDate(
        yesterday.getDate() - 1
    )

    const dateStr =
        yesterday.getFullYear() +
        '-' +
        String(yesterday.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(yesterday.getDate()).padStart(2, '0')
    console.log('dateStr', dateStr)
    // ========================================
    // CHECK CALENDAR
    // ========================================

    const calendarRes = await repo.getCalendarDay(dateStr)
    console.log(calendarRes.rows)
    const calendar = calendarRes.rows[0]

    // ========================================
    // NOT WORKING DAY
    // ========================================

    if (
        calendar &&
        calendar.is_working_day === false
    ) {

        return {

            safe: true,

            holiday: true,

            note: calendar.note || 'Ngày nghỉ',

            total_zones: 0,

            missing: 0,
            draft: 0,
            overdue: 0
        }
    }


    const { rows } = await repo.getInspectionHealth(campusId)

    let missing = 0
    let draft = 0
    let overdue = 0

    rows.forEach(r => {

        if (!r.status) {
            missing++
            return
        }

        if (r.status === 'draft') {
            draft++
        }

        if (r.status === 'overdue') {
            overdue++
        }
    })

    const safe =
        missing === 0 &&
        draft === 0 &&
        overdue === 0

    return {
        safe,

        total_zones: rows.length,

        missing,
        draft,
        overdue
    }
}

// ============================================
// SUMMARY
// ============================================

exports.getSummary = async (campusId) => {

    const [
        repairRes,
        periodicRes,
        incidentRes
    ] = await Promise.all([

        repo.getRepairSummary(campusId),
        repo.getPeriodicSummary(campusId),
        repo.getIncidentSummary(campusId)
    ])

    const repair = repairRes.rows[0]
    const periodic = periodicRes.rows[0]
    const incident = incidentRes.rows[0]

    return {

        repair: {
            total: Number(repair.total),
            pending: Number(repair.pending),
            processing: Number(repair.processing),
            done: Number(repair.done)
        },

        periodic: {
            total: Number(periodic.total),
            pending: Number(periodic.pending),
            overdue: Number(periodic.overdue),
            done: Number(periodic.done)
        },

        incident: {
            total: Number(incident.total),
            pending: Number(incident.pending),
            processing: Number(incident.processing),
            done: Number(incident.done)
        }
    }
}

// ============================================
// MONTHLY TASKS
// ============================================

exports.getMonthlyTasks = async (campusId) => {

    const [
        periodicRes,
        incidentRes
    ] = await Promise.all([

        repo.getPeriodicTasks(campusId),
        repo.getIncidentTasks(campusId)
    ])

    const tasks = []

    // ========================================
    // PERIODIC
    // ========================================

    periodicRes.rows.forEach(j => {

        const overdue =
            new Date(j.due_date) < new Date()

        tasks.push({

            module: j.type_code === 'inspection' ?
                'inspection'
                : j.type_code === 'maintenance' ?
                    'maintenance'
                    : 'operation',

            title: j.title,

            status: overdue
                ? 'overdue'
                : 'pending',

            status_text: overdue
                ? 'Quá hạn'
                : 'Chờ xử lý',

            date: j.due_date,

            url: j.type_code === 'inspection' ?
                `/tech/periodic-work/${j.id}/rooms`
                : j.type_code === 'maintenance' ?
                    `/tech/periodic-work/${j.id}/submit-maintenance`
                    : `/tech/periodic-work/${j.id}/submit-operation`
        })
    })

    // ========================================
    // INCIDENT
    // ========================================

    incidentRes.rows.forEach(j => {

        let status = 'pending'
        let statusText = 'Mới'

        if (
            j.status === 'IN_PROGRESS' ||
            j.status === 'REVIEWING'
        ) {

            status = 'processing'
            statusText = 'Đang xử lý'
        }

        tasks.push({

            module: 'incident-work',

            title: j.title,

            status,

            status_text: statusText,

            date: j.due_date,

            url: `/tech/incident-work/${j.id}`
        })
    })

    // ========================================
    // SORT
    // overdue -> processing -> pending
    // ========================================

    const priority = {
        overdue: 1,
        processing: 2,
        pending: 3
    }

    tasks.sort((a, b) => {

        const pa = priority[a.status]
        const pb = priority[b.status]

        if (pa !== pb) {
            return pa - pb
        }

        return new Date(a.date) - new Date(b.date)
    })

    return tasks
}

// ============================================
// RECENT COMPLETED
// ============================================

exports.getRecentCompleted = async (campusId) => {

    const [
        repairRes,
        periodicRes,
        incidentRes
    ] = await Promise.all([

        repo.getRecentRepairCompleted(campusId),
        repo.getRecentPeriodicCompleted(campusId),
        repo.getRecentIncidentCompleted(campusId)
    ])

    const items = []

    // ========================================
    // REPAIR
    // ========================================

    repairRes.rows.forEach(r => {

        items.push({

            module: 'repair',

            title: r.asset_type_name,

            time: r.completed_at,

            location: `${r.room_name}-${r.room_code}`,

            url: `/tech/repairs` //r.id
        })
    })

    // ========================================
    // PERIODIC
    // ========================================

    periodicRes.rows.forEach(r => {

        items.push({

            module: 'periodic-work',

            title: r.title,

            time: r.completed_at,
            location: 'Khu vực chung',

            url: `/tech/periodic-work`
        })
    })

    // ========================================
    // INSPECTION
    // ========================================

    incidentRes.rows.forEach(r => {

        items.push({

            module: 'incident-work',

            title: r.title,

            time: r.updated_at,
            location: 'Khu vực chung',

            url: `/tech/incident-work` //$ }{r.id
        })
    })

    // ========================================
    // SORT DESC
    // ========================================

    items.sort((a, b) => {

        return new Date(b.time) - new Date(a.time)
    })

    return items.slice(0, 10)
}

// ============================================
// SUMMER WORK
// ============================================

exports.getSummerWorkDashboard = async (
    campusId,
    query
) => {

    const year =
        query.year
        || new Date().getFullYear()

    const { rows } =
        await repo.getSummerWorkDashboard(
            campusId,
            year
        )

    const result = {

        internal: {
            periodic: [],
            incident: []
        },

        xd: {
            periodic: [],
            incident: []
        },

        me: {
            periodic: [],
            incident: []
        }

    }

    rows.forEach(item => {

        // ================= INTERNAL =================
        if (
            item.work_type === 'INTERNAL'
        ) {

            if (
                item.source === 'PERIODIC'
            ) {

                result.internal.periodic
                    .push(item)

            } else {

                result.internal.incident
                    .push(item)

            }

            return

        }

        // ================= XD =================
        if (
            item.work_group === 'XD'
        ) {

            if (
                item.source === 'PERIODIC'
            ) {

                result.xd.periodic
                    .push(item)

            } else {

                result.xd.incident
                    .push(item)

            }

            return

        }

        // ================= ME =================
        if (
            item.work_group === 'ME'
        ) {

            if (
                item.source === 'PERIODIC'
            ) {

                result.me.periodic
                    .push(item)

            } else {

                result.me.incident
                    .push(item)

            }

        }

    })

    return result

}