const uploadAdminService = require('./upload.admin.service');

exports.rotateImage = async (req, res) => {

    try {

        const { direction } = req.body;

        await uploadAdminService.rotateImage(
            req.params.id,
            direction,
            req.campus_id
        );

        return res.json({
            success: true,
            message: 'Image rotated successfully'
        });

    } catch (err) {

        return res.status(400).json({
            success: false,
            message: err.message
        });

    }

};