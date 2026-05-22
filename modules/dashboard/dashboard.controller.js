const service = require('./dashboard.service')

// HEALTH
exports.getHealth = async (req, res) => {

    try {

        const campusId = req.user.campus_id

        const data = await service.getHealth(campusId)

        res.json({
            success: true,
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// SUMMARY
exports.getSummary = async (req, res) => {

    try {

        const campusId = req.user.campus_id

        const data = await service.getSummary(campusId)

        res.json({
            success: true,
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// MONTHLY TASKS
exports.getMonthlyTasks = async (req, res) => {

    try {

        const campusId = req.user.campus_id

        const data = await service.getMonthlyTasks(campusId)

        res.json({
            success: true,
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// RECENT COMPLETED
exports.getRecentCompleted = async (req, res) => {

    try {

        const campusId = req.user.campus_id

        const data = await service.getRecentCompleted(campusId)

        res.json({
            success: true,
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

exports.getSummerWorkDashboard = async (req, res) => {

    try {

        const campusId =
            req.session.campus_id

        const data =
            await service.getSummerWorkDashboard(
                campusId,
                req.query
            )

        return res.json({
            success: true,
            message: 'Summer work dashboard',
            data,
            pagination: null
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}