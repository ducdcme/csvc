// Service: Master Data Business Logic
const repo = require('./master-data.repository');
const { getCurrentAcademicYear } = require('../../infrastructure/utils/academicYear');
// Campus
exports.getCampuses = () => repo.getCampuses();
exports.createCampus = (data) => repo.createCampus(data);
exports.updateCampus = (id, data) => repo.updateCampus(id, data);
exports.deleteCampus = (id) => repo.deleteCampus(id);

// Building
exports.getBuildings = (campus_id) => repo.getBuildings(campus_id);
exports.getBuildingDetail = (campus_id, id) => repo.getBuildingDetail(campus_id, id)

exports.createBuilding = async (campus_id, data) => {
    if (!data.code) {
        throw new Error('Building code is required')
    }

    if (!data.name) {
        throw new Error('Building name is required')
    }
    return await repo.createBuilding(campus_id, data);
}
exports.updateBuilding = async (campus_id, id, data) => {
    if (!data.code) {
        throw new Error('Building code is required')
    }

    if (!data.name) {
        throw new Error('Building name is required')
    }
    return await repo.updateBuilding(campus_id, id, data)
}
exports.deleteBuilding = async (campus_id, id) => {
    const totalFloor =
        await repo.countFloorByBuilding(
            campus_id,
            id
        )

    if (totalFloor > 0) {

        throw new Error(
            'Cannot delete building with floors'
        )

    }
    return await repo.deleteBuilding(campus_id, id)
}

// Floor
exports.getFloors = async (campusId, query) => {

    if (!query.building_id) {
        return []
    }

    return await repo.getFloors(campusId, query.building_id)

}

exports.getFloorDetail = (campus_id, id) => repo.getFloorDetail(campus_id, id)
exports.createFloor = async (campus_id, data) => {
    if (!data.building_id) {
        throw new Error('Building is required')
    }

    if (!data.code) {
        throw new Error('Floor code is required')
    }

    if (!data.name) {
        throw new Error('Floor name is required')
    }
    return await repo.createFloor(campus_id, data);
}
exports.updateFloor = async (campus_id, id, data) => {
    if (!data.building_id) {
        throw new Error('Building is required')
    }

    if (!data.code) {
        throw new Error('Floor code is required')
    }

    if (!data.name) {
        throw new Error('Floor name is required')
    }
    return await repo.updateFloor(campus_id, id, data);
}
exports.deleteFloor = async (campus_id, id) => {
    const totalRoom =
        await repo.countRoomByFloor(
            campus_id,
            id
        )

    if (totalRoom > 0) {

        throw new Error(
            'Cannot delete floor with rooms'
        )

    }

    return await repo.deleteFloor(campus_id, id)
}

// Room
exports.getRooms = async (campusId, query) => {

    if (!query.floor_id) {
        return []
    }

    return await repo.getRooms(campusId, query)

}
exports.getRoomDetail = (campus_id, id) => repo.getRoomDetail(campus_id, id)
exports.createRoom = async (campus_id, data) => {

    if (!data.building_id) {
        throw new Error('Building is required')
    }

    if (!data.floor_id) {
        throw new Error('Floor is required')
    }

    if (!data.code) {
        throw new Error('Room code is required')
    }

    return await repo.createRoom(campus_id, data)

}
exports.updateRoom = async (campus_id, id, data) => {
    if (!data.floor_id) {
        throw new Error('Floor is required')
    }

    if (!data.code) {
        throw new Error('Room code is required')
    }

    return await repo.updateRoom(campus_id, id, data);
}
exports.deleteRoom = async (campus_id, id) => {
    const used =
        await repo.checkRoomInUse(
            campus_id,
            id
        )

    if (used) {

        throw new Error(
            'Room is in use'
        )

    }

    return await repo.deleteRoom(
        campus_id,
        id
    )
}

// Asset
exports.getAssets = (campus_id) => repo.getAssets(campus_id);
exports.getAssetDetail = (id) => repo.getAssetDetail(id)
exports.createAsset = async (campus_id, data) => {

    if (!data.code) {
        throw new Error('Asset code is required')
    }

    if (!data.name) {
        throw new Error('Asset name is required')
    }

    return await repo.createAsset(
        campus_id,
        data
    )

}
exports.updateAsset = async (campus_id, id, data) => {

    if (!data.code) {
        throw new Error('Asset code is required')
    }

    if (!data.name) {
        throw new Error('Asset name is required')
    }

    return await repo.updateAsset(campus_id, id, data)

}

exports.deleteAsset = async (campus_id, id) => {

    const total = await repo.countRoomTypeAssetByAsset(campus_id, id)

    if (total > 0) {
        throw new Error('Asset is already mapped')
    }

    return await repo.deleteAsset(campus_id, id)

}


//Room Type
exports.getRoomTypes = (campus_id) => repo.getRoomTypes(campus_id)
exports.getRoomTypeDetail = (id) => repo.getRoomTypeDetail(id)
exports.createRoomType = async (campus_id, data) => {

    if (!data.code) {
        throw new Error('Room type code is required')
    }

    if (!data.name) {
        throw new Error('Room type name is required')
    }

    return await repo.createRoomType(
        campus_id,
        data
    )

}



exports.updateRoomType = async (
    campus_id,
    id,
    data
) => {

    if (!data.code) {
        throw new Error('Room type code is required')
    }

    if (!data.name) {
        throw new Error('Room type name is required')
    }

    return await repo.updateRoomType(
        campus_id,
        id,
        data
    )

}



exports.deleteRoomType = async (
    campus_id,
    id
) => {

    const totalRoom =
        await repo.countRoomByRoomType(
            campus_id,
            id
        )

    if (totalRoom > 0) {

        throw new Error(
            'Room type is already used'
        )

    }

    return await repo.deleteRoomType(
        campus_id,
        id
    )

}
/*
|--------------------------------------------------------------------------
| ROOM TYPE ASSET
|--------------------------------------------------------------------------
*/

exports.getRoomTypeAssets = (campus_id, room_type_id) => repo.getRoomTypeAssets(campus_id, room_type_id)



exports.toggleRoomTypeAsset = async (
    campus_id,
    data
) => {

    if (!data.room_type_id) {
        throw new Error('Room type is required')
    }

    if (!data.asset_type_id) {
        throw new Error('Asset type is required')
    }

    if (data.checked) {

        return await repo.addRoomTypeAsset(
            campus_id,
            data
        )

    }

    return await repo.removeRoomTypeAsset(
        campus_id,
        data
    )

}

/*
|--------------------------------------------------------------------------
| ROOM NAME
|--------------------------------------------------------------------------
*/

exports.getRoomNames = (campus_id, query) => repo.getRoomNames(campus_id, query)

exports.upsertRoomName = async (campus_id, data) => {
    if (!data.room_id) {
        throw new Error('Room is required')
    }

    if (!data.academic_year) {
        throw new Error('Academic year is required')
    }

    return await repo.upsertRoomName(campus_id, data)

}
//Import Room Name
exports.importRoomNames = async (campus_id, data) => {
    for (const item of data) {
        await repo.insertRoomName(
            campus_id,
            item.building_id,
            item.room_code,
            item.academic_year,
            item.room_name
        );
    }
};
// Public
/**
 * PUBLIC - Location Tree (Building → Floor → Room)
 */


exports.getLocationPublic = async (campus_id) => {
    const academic_year = getCurrentAcademicYear();

    const rows = await repo.getLocationTree(campus_id, academic_year);

    const result = [];

    rows.forEach(row => {
        let building = result.find(b => b.building_id === row.building_id);
        if (!building) {
            building = {
                building_id: row.building_id,
                building_code: row.building_code,
                building_name: row.building_name,
                floors: []
            };
            result.push(building);
        }

        if (!row.floor_id) return;

        let floor = building.floors.find(f => f.floor_id === row.floor_id);
        if (!floor) {
            floor = {
                floor_id: row.floor_id,
                floor_code: row.floor_code,
                floor_name: row.floor_name,
                rooms: []
            };
            building.floors.push(floor);
        }

        if (!row.room_id) return;

        floor.rooms.push({
            room_id: row.room_id,
            room_code: row.room_code,
            room_name: row.room_name
        });
    });

    return result;
};
exports.getAssetsByRoomPublic = (campus_id, room_id) => repo.getAssetsByRoomPublic(campus_id, room_id);