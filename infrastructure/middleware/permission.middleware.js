/**
 * Permission middleware (RBAC)
 * usage: checkPermission('repair', 'create')
 */
// Middleware: Check permission

const isDev = process.env.NODE_ENV !== 'production';

module.exports = function requirePermission(requiredPermission) {

    return (req, res, next) => {

        try {

            const user = req.user;

            console.log("====== PERMISSION DEBUG ======");
            console.log("Required Permission:", requiredPermission);
            console.log("User ID:", user?.id);
            console.log("Username:", user?.username);
            console.log("Permissions:", user?.permissions);
            console.log("==============================");

            // chưa login / chưa attach user
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                    data: null,
                    pagination: null
                });
            }

            // permissions không hợp lệ
            if (!Array.isArray(user.permissions)) {

                console.warn(
                    `[PERMISSION] Invalid permissions format for user ${user.id}`
                );

                return res.status(403).json({
                    success: false,
                    message: "Forbidden",
                    data: null,
                    pagination: null
                });
            }

            // thiếu permission
            if (!user.permissions.includes(requiredPermission)) {

                console.warn(
                    `[PERMISSION] User ${user.id} missing permission: ${requiredPermission}`
                );

                const response = {
                    success: false,
                    message: "Permission denied",
                    data: null,
                    pagination: null
                };

                // DEV MODE → trả chi tiết để debug
                if (isDev) {
                    response.required_permission = requiredPermission;
                    response.current_permissions = user.permissions;
                }

                return res.status(403).json(response);
            }

            next();

        } catch (error) {

            console.error("[PERMISSION MIDDLEWARE ERROR]", error);

            next(error);
        }
    };
};