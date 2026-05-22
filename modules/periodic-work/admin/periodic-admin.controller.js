/**
 * Controller
 * ONLY request/response
 */

const service = require('./periodic-admin.service')



/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

exports.getTypes = async (req, res) => {

    const data =
        await service.getTypes()

    return res.json({
        success: true,
        data,
        pagination: null
    })

}



/*
|--------------------------------------------------------------------------
| DEFINITIONS
|--------------------------------------------------------------------------
*/

exports.getDefinitions = async (req, res) => {

    const campusId =
        req.session.campus_id

    const data =
        await service.getDefinitions(
            campusId,
            req.query
        )

    return res.json({
        success: true,
        data,
        pagination: null
    })

}



exports.getDefinitionById = async (req, res) => {

    const campusId =
        req.session.campus_id

    const data =
        await service.getDefinitionById(
            req.params.id,
            campusId
        )

    return res.json({
        success: true,
        data,
        pagination: null
    })

}



exports.createDefinition = async (req, res) => {

    const campusId =
        req.session.campus_id

    const data =
        await service.createDefinition(
            campusId,
            req.body
        )

    return res.json({
        success: true,
        message: 'Definition created',
        data
    })

}



exports.updateDefinition = async (req, res) => {

    const campusId =
        req.session.campus_id

    const data =
        await service.updateDefinition(
            req.params.id,
            campusId,
            req.body
        )

    return res.json({
        success: true,
        message: 'Definition updated',
        data
    })

}



exports.deleteDefinition = async (req, res) => {

    const campusId =
        req.session.campus_id

    await service.deleteDefinition(
        req.params.id,
        campusId
    )

    return res.json({
        success: true,
        message: 'Definition deleted',
        data: null
    })

}
exports.updateDefinitionStatus = async (req, res) => {

    const campusId = req.session.campus_id

    const data = await service.updateDefinitionStatus(
        req.params.id,
        campusId,
        req.body.status
    )

    return res.json({
        success: true,
        message: 'Status updated',
        data
    })

}
exports.getJobs = async (req, res) => {

    const campusId = req.session.campus_id

    const data =
        await service.getJobs(
            campusId,
            req.query
        )

    return res.json({
        success: true,
        data,
        pagination: null
    })

}
exports.getJobDetail = async (req, res) => {

    const campusId = req.session.campus_id

    const data = await service.getJobDetail(
        req.params.id,
        campusId
    )

    return res.json({
        success: true,
        data,
        pagination: null
    })

}



exports.updateJobStatus = async (req, res) => {

    const campusId = req.session.campus_id

    const userId = req.session.user.id

    const data = await service.updateJobStatus(
        req.params.id,
        campusId,
        userId,
        req.body.status
    )

    return res.json({
        success: true,
        message: 'Job status updated',
        data
    })

}
exports.getJobRuntimeDetail = async (req, res) => {

    const campusId =
        req.session.campus_id

    const data =
        await service.getJobRuntimeDetail(
            req.params.id,
            campusId
        )

    return res.json({
        success: true,
        data,
        pagination: null
    })

}
exports.generateJob = async (req, res) => {

    const campusId = req.session.campus_id

    const data = await service.generateJob(
        campusId,
        req.body
    )

    return res.json({
        success: true,
        message: 'Job generated successfully',
        data
    })

}

exports.assignRoomsToJob = async (req, res) => {

    const campusId = req.session.campus_id

    const data = await service.assignRoomsToJob(
        req.params.id,
        campusId,
        req.body.room_ids || []
    )

    return res.json({
        success: true,
        message: 'Rooms assigned successfully',
        data
    })

}


exports.removeRoomFromJob = async (req, res) => {

    const campusId = req.session.campus_id

    await service.removeRoomFromJob(
        req.params.jobId,
        req.params.roomId,
        campusId
    )

    return res.json({
        success: true,
        message: 'Room removed successfully',
        data: null
    })

}
exports.updateJobBusinessInfo = async (req, res) => {
    try {
        const campusId =
            req.session.campus_id

        const data =
            await service.updateJobBusinessInfo(
                req.params.id,
                campusId,
                req.body
            )

        return res.json({
            success: true,
            message:
                'Business info updated successfully',
            data
        })
    } catch (err) {
        res.json({
            success: false,
            message: err.message
        })
    }
}