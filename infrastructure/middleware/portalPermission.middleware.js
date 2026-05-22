// infrastructure/middleware/portalPermission.middleware.js

module.exports = function portalPermission(requiredPermissions, options = {}) {
    console.log('PORTAL PERMISSION RUNNING');
    const permissionsRequired = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    const {
        match = 'any', // any | all
        redirect = '/403'
    } = options;

    return (req, res, next) => {

        try {

            const user = req.user;
            console.log('USER:', req.user);
            console.log('PERMISSIONS:', req.user?.permissions);
            // chưa login
            if (!user) {
                return res.redirect('/guest/login');
            }

            const permissions = user.permissions || [];

            // permissions không hợp lệ
            if (!Array.isArray(permissions)) {

                console.warn(
                    `[PORTAL PERMISSION] Invalid permissions for user ${user.id}`
                );

                return res.redirect(redirect);
            }

            // check permission
            let hasPermission = false;

            if (match === 'all') {

                hasPermission = permissionsRequired.every(p =>
                    permissions.includes(p)
                );

            } else {

                hasPermission = permissionsRequired.some(p =>
                    permissions.includes(p)
                );
            }

            // không đủ quyền
            if (!hasPermission) {

                console.warn(
                    `[PORTAL PERMISSION] User ${user.id} denied`,
                    permissionsRequired
                );

                // lưu message để hiển thị UI
                req.session.permissionError = {
                    message: 'Bạn không có quyền truy cập chức năng này',
                    requiredPermissions: permissionsRequired
                };

                return res.redirect(redirect);
            }

            next();

        } catch (error) {

            console.error(
                '[PORTAL PERMISSION ERROR]',
                error
            );

            return res.redirect('/500');
        }
    };
};