/**

* API NORMALIZER
* * Chuẩn hoá data từ backend → format FE dùng thống nhất
* * Không phụ thuộc field backend (name, code, id...)
    */

// =========================
// NORMALIZE ASSET
// =========================
function normalizeAsset(a) {
    return {
        id: a.asset_type_id || a.id,
        code: a.asset_type_code || a.code,
        name: a.asset_type_name || a.name
    }
}

// =========================
// NORMALIZE ROOM
// =========================
function normalizeRoom(r, floor, building) {
    return {
        id: r.room_id,
        code: r.room_code,
        name: r.room_name,
        floor_id: floor.floor_id,
        floor_name: floor.floor_name,
        building_id: building.building_id,
        building_name: building.building_name
    }
}

// =========================
// NORMALIZE LOCATION
// =========================
function normalizeLocation(data) {


    const buildings = []
    const allRooms = []

    data.forEach(b => {

        const building = {
            id: b.building_id,
            name: b.building_name,
            floors: []
        }

        b.floors.forEach(f => {

            const floor = {
                id: f.floor_id,
                name: f.floor_name,
                rooms: []
            }

            f.rooms.forEach(r => {

                const room = normalizeRoom(r, f, b)

                floor.rooms.push(room)
                allRooms.push(room)
            })

            building.floors.push(floor)
        })

        buildings.push(building)
    })

    return {
        buildings,
        allRooms
    }


}

// =========================
// EXPORT GLOBAL
// =========================
window.normalize = {
    asset: normalizeAsset,
    location: normalizeLocation
}
