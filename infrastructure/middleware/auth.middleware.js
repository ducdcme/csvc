// Middleware: Check authentication

module.exports = function authMiddleware(req, res, next) {
    try {
        console.log("=== AUTH MIDDLEWARE ===");
        console.log("Base URL:", req.baseUrl);
        console.log("Session:", req.session);
        console.log("Session user:", req.session?.user);
        console.log("=======================");
        // Các route cần login: /user, /admin
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null,
                pagination: null
            });
        }

        // Gán user từ session
        req.user = {
            id: req.session.user.id,
            username: req.session.user.username,
            full_name: req.session.user.full_name,
            roles: req.session.roles,
            permissions: req.session.permissions,
            campus_id: req.session.campus_id,
            campus_name: req.session.campus_name
        };

        console.log("AUTH SET req.user:", req.user);

        next();
    } catch (error) {
        next(error);
    }
};