const campusService = require('./campus.service');

// GET /campus
exports.getCampusList = async (req, res, next) => {
    try {
        const result = await campusService.getCampusList();

        res.json({
            success: true,
            message: "Campus list",
            data: result,
            pagination: null
        });
    } catch (error) {
        next(error);
    }
};

// POST /campus/select
exports.selectCampus = async (req, res, next) => {
    try {
        const campusId = req.body.campus_id;

        const result = await campusService.selectCampus(req.session, campusId);

        // 🔥 BẮT BUỘC với DB session store
        req.session.save((err) => {

            if (err) return next(err);

            res.json({
                success: true,
                message: "Campus selected",
                data: result,
                pagination: null
            });

        });

    } catch (error) {
        return res.status(403).json({
            success: false,
            message: error.message,
            data: null,
            pagination: null
        });
    }
};

// GET /campus/current
exports.getCurrentCampus = async (req, res, next) => {
    try {
        if (!req.session.campus_id) {
            return res.json({
                success: false,
                message: "No campus selected",
                data: null,
                pagination: null
            });
        }

        res.json({
            success: true,
            message: "Current campus",
            data: {
                campus_id: req.session.campus_id,
                campus_name: req.session.campus_name
            },
            pagination: null
        });
    } catch (error) {
        next(error);
    }
};