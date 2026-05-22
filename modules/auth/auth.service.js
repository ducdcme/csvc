// Service: Auth business logic

const bcrypt = require('bcrypt');
const authRepository = require('./auth.repository');

exports.login = async ({ username, password }, session) => {
    if (!session.campus_id) {
        throw new Error("Campus not selected");
    }

    // 1. Find user by username + campus
    const user = await authRepository.findUserByUsername(username, session.campus_id);
    if (!user) {
        throw new Error("Invalid username or password");
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid username or password");
    }

    // 3. Get roles
    const roles = await authRepository.getUserRoles(user.id);

    // 4. Get permissions
    const permissions = await authRepository.getUserPermissions(user.id);

    // 5. Save session
    session.user = {
        id: user.id,
        username: user.username,
        full_name: user.full_name
    };

    session.roles = roles.map(r => r.code);
    session.permissions = permissions.map(p => p.code);

    return {
        user: session.user,
        roles: session.roles,
        permissions: session.permissions
    };
};
exports.changePassword = async ({
    userId,
    old_password,
    new_password,
    confirm_password
}) => {

    // 1. Validate input
    if (!old_password || !new_password || !confirm_password) {
        throw new Error("Missing required fields");
    }

    if (new_password !== confirm_password) {
        throw new Error("New password does not match");
    }

    // 2. Get current password
    const user = await authRepository.getUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // 3. Check old password
    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
        throw new Error("Old password is incorrect");
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // 5. Update password
    await authRepository.updatePassword(userId, hashedPassword);
};