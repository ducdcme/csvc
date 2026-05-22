// Controller: Master Data Controller
const service = require('./master-data.service');

// ==================== CAMPUS ====================
exports.getCampuses = async (req, res) => {
    try {
        const data = await service.getCampuses();
        res.json({ success: true, message: 'OK', data, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.createCampus = async (req, res) => {
    try {
        const id = await service.createCampus(req.body);
        res.json({ success: true, message: 'Campus created', data: { id }, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.updateCampus = async (req, res) => {
    try {
        await service.updateCampus(req.params.id, req.body);
        res.json({ success: true, message: 'Campus updated', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.deleteCampus = async (req, res) => {
    try {
        await service.deleteCampus(req.params.id);
        res.json({ success: true, message: 'Campus deleted', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};


// ==================== BUILDING ====================
exports.getBuildings = async (req, res) => {
    try {
        const data = await service.getBuildings(req.campus_id);
        res.json({ success: true, message: 'OK', data, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.getBuildingDetail = async (req, res) => {

    try {

        const data = await service.getBuildingDetail(req.campus_id, req.params.id)

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}

exports.createBuilding = async (req, res) => {
    try {
        const id = await service.createBuilding(req.campus_id, req.body);
        res.json({ success: true, message: 'Building created', data: { id }, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.updateBuilding = async (req, res) => {
    try {
        await service.updateBuilding(req.campus_id, req.params.id, req.body);
        res.json({ success: true, message: 'Building updated', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.deleteBuilding = async (req, res) => {
    try {
        await service.deleteBuilding(req.campus_id, req.params.id);
        res.json({ success: true, message: 'Building deleted', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};


// ==================== FLOOR ====================
exports.getFloors = async (req, res) => {

    try {

        const data = await service.getFloors(req.campus_id, req.query)

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}

exports.getFloorDetail = async (req, res) => {
    try {
        const data = await service.getFloorDetail(req.campus_id, req.params.id)
        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.createFloor = async (req, res) => {
    try {
        const id = await service.createFloor(req.campus_id, req.body);
        res.json({ success: true, message: 'Floor created', data: { id }, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.updateFloor = async (req, res) => {
    try {
        await service.updateFloor(req.campus_id, req.params.id, req.body);
        res.json({ success: true, message: 'Floor updated', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.deleteFloor = async (req, res) => {
    try {
        await service.deleteFloor(req.campus_id, req.params.id);
        res.json({ success: true, message: 'Floor deleted', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};


// ==================== ROOM ====================
exports.getRooms = async (req, res) => {

    try {

        const data = await service.getRooms(req.campus_id, req.query)

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        console.error(err)

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.getRoomDetail = async (req, res) => {
    try {
        const data = await service.getRoomDetail(req.campus_id, req.params.id)
        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.createRoom = async (req, res) => {
    try {
        const id = await service.createRoom(req.campus_id, req.body);
        res.json({ success: true, message: 'Room created', data: { id }, pagination: null });
    } catch (err) {
        console.error(err)
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        await service.updateRoom(req.campus_id, req.params.id, req.body);
        res.json({ success: true, message: 'Room updated', data: {}, pagination: null });
    } catch (err) {
        console.error(err)
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await service.deleteRoom(req.campus_id, req.params.id);
        res.json({ success: true, message: 'Room deleted', data: {}, pagination: null });
    } catch (err) {
        console.error(err)
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};


// ==================== ASSET ====================
exports.getAssets = async (req, res) => {
    try {
        const data = await service.getAssets(req.campus_id);
        res.json({ success: true, message: 'OK', data, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};
exports.getAssetDetail = async (req, res) => {
    try {

        const data = await service.getAssetDetail(req.params.id)

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.createAsset = async (req, res) => {
    try {
        const id = await service.createAsset(req.campus_id, req.body);
        res.json({ success: true, message: 'Asset created', data: { id }, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.updateAsset = async (req, res) => {
    try {
        await service.updateAsset(req.campus_id, req.params.id, req.body);
        res.json({ success: true, message: 'Asset updated', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        await service.deleteAsset(req.campus_id, req.params.id);
        res.json({ success: true, message: 'Asset deleted', data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};


// ==================== ROOM TYPE ====================
exports.getRoomTypes = async (req, res) => {
    try {
        const data = await service.getRoomTypes(req.campus_id);
        res.json({ success: true, message: "OK", data: data, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};
exports.getRoomTypeDetail = async (req, res) => {
    try {
        const data = await service.getRoomTypeDetail(req.params.id)

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.createRoomType = async (req, res) => {
    try {
        const id = await service.createRoomType(req.campus_id, req.body);
        res.json({ success: true, message: "Created", data: { id }, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};
exports.updateRoomType = async (req, res) => {
    try {
        await service.updateRoomType(req.campus_id, req.params.id, req.body);
        res.json({ success: true, message: "Updated", data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};
exports.deleteRoomType = async (req, res) => {
    try {
        await service.deleteRoomType(req.campus_id, req.params.id);
        res.json({ success: true, message: "Deleted", data: {}, pagination: null });
    } catch (err) {
        res.json({ success: false, message: err.message, data: null, pagination: null });
    }
};
exports.getRoomTypeAssets = async (
    req,
    res
) => {

    try {

        const data =
            await service.getRoomTypeAssets(
                req.query.room_type_id
            )

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.toggleRoomTypeAsset = async (req, res) => {
    try {
        const campus_id = req.campus_id;
        const data = req.body;
        await service.toggleRoomTypeAsset(campus_id, data);
        res.json({
            success: true,
            message: "OK",
            data: null,
            pagination: null
        });
    } catch (err) {
        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        });
    }
};
//ROOM NAME
exports.getRoomNames = async (req, res) => {
    try {
        const data = await service.getRoomNames(req.campus_id,
            req.query
        )

        res.json({
            success: true,
            message: 'OK',
            data,
            pagination: null
        })

    } catch (err) {

        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}
exports.upsertRoomName = async (req, res) => {
    try {
        await service.upsertRoomName(req.campus_id, req.body)
        res.json({
            success: true,
            message: 'Saved',
            data: {},
            pagination: null
        })

    } catch (err) {
        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        })

    }

}

//IMPORT ROOM NAME
exports.importRoomNames = async (req, res) => {
    try {
        const campus_id = req.campus_id;
        const data = req.body;
        // data = [{building_id, room_code, academic_year, room_name}]

        await service.importRoomNames(campus_id, data);

        res.json({
            success: true,
            message: "Import success",
            data: null,
            pagination: null
        });
    } catch (err) {
        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        });
    }
};

// ==================== PUBLIC ====================
exports.getLocationPublic = async (req, res) => {
    try {
        const campus_id = req.campus_id;

        const data = await service.getLocationPublic(campus_id);

        res.json({
            success: true,
            message: "OK",
            data: data,
            pagination: null
        });
    } catch (err) {
        console.error(err);
        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        });
    }
};
/**
 * PUBLIC - Assets by Room
 */
exports.getAssetsByRoomPublic = async (req, res) => {
    try {
        const campus_id = req.campus_id;
        const room_id = parseInt(req.params.room_id);

        const data = await service.getAssetsByRoomPublic(campus_id, room_id);

        res.json({
            success: true,
            message: "OK",
            data: data,
            pagination: null
        });
    } catch (err) {
        console.error(err);
        res.json({
            success: false,
            message: err.message,
            data: null,
            pagination: null
        });
    }
};