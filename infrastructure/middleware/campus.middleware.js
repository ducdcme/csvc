// Middleware: Check campus selected

module.exports = function campusMiddleware(req, res, next) {
    try {
        const campusId = req.session ? req.session.campus_id : null;
        const campusName = req.session ? req.session.campus_name : null;
        // Dùng originalUrl vì router mount /api
        const url = req.originalUrl;
        // Các API được phép khi chưa chọn campus
        const allowPaths = [
            '/api/campus',
            '/api/campus/select',
            '/api/auth/login',
            '/api/auth/logout',
            '/api/test'
        ];

        const isAllowed = allowPaths.some(path => url.startsWith(path));

        // Nếu chưa chọn campus và không phải public API
        if (!campusId && !isAllowed) {
            return res.status(400).json({
                success: false,
                message: "Campus not selected",
                data: null,
                pagination: null
            });
        }

        // Gắn campus vào request
        if (campusId) {
            req.campus_id = campusId;
            req.campus_name = campusName;
        }

        next();
    } catch (error) {
        next(error);
    }
};