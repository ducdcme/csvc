// Service: Business logic for campus selection

const campusRepository = require('./campus.repository');

exports.getCampusList = async () => {
    const campuses = await campusRepository.getAllActiveCampuses();
    return campuses;
};

exports.selectCampus = async (session, campusId) => {
    // Check campus exists
    const campus = await campusRepository.getCampusById(campusId);
    if (!campus) {
        throw new Error("Campus not found");
    }
    // 🔥 2. CHECK USER (nếu đã login)
    const userId = session.user?.id;

    if (userId) {
        const isAllowed = await campusRepository.checkUserCampus(userId, campusId);

        if (!isAllowed) {
            throw new Error("Access denied for this campus");
        }
    }
    // Save campus to session
    session.campus_id = campus.id;
    session.campus_name = campus.name;

    return {
        campus_id: campus.id,
        campus_name: campus.name
    };
};