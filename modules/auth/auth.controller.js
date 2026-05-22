// Controller: Auth

const authService = require('./auth.service');

exports.login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body, req.session);

        res.json({
            success: true,
            message: "Login successful",
            data: result,
            pagination: null
        });
    } catch (error) {
        console.error(err);
        res.json({
            success: false,
            message: err.message || "Login failed",
            data: null,
            pagination: null
        });
    }
};

exports.logout = async (req, res, next) => {
    try {
        // Xóa thông tin user nhưng giữ campus
        delete req.session.user;
        delete req.session.roles;
        delete req.session.permissions;

        res.json({
            success: true,
            message: "Logout successful",
            data: null,
            pagination: null
        });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        // ❗ CHECK LOGIN
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null,
                pagination: null
            });
        }

        res.json({
            success: true,
            message: "Current user",
            data: {
                user: req.session.user,
                campus_id: req.session.campus_id,
                campus_name: req.session.campus_name,
                roles: req.session.roles,
                permissions: req.session.permissions
            },
            pagination: null
        });
    } catch (error) {
        next(error);
    }
};
exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { old_password, new_password, confirm_password } = req.body;

        await authService.changePassword({
            userId,
            old_password,
            new_password,
            confirm_password
        });

        res.json({
            success: true,
            message: "Password changed successfully",
            data: null,
            pagination: null
        });

    } catch (error) {
        // ❗ TRẢ JSON thay vì next(error)
        return res.status(400).json({
            success: false,
            message: error.message || "Change password failed",
            data: null,
            pagination: null
        });
    }
};