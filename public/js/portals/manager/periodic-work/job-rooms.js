const JOB_ID =
    window.location.pathname
        .split('/')
        .slice(-2)[0]

let locationTree = []

let currentBuilding = null

let currentFloor = null

let selectedRoomIds = []

let assignedRooms = []



document.addEventListener('DOMContentLoaded', async () => {

    bindEvents()

    await loadAssignedRooms()

    await loadLocationTree()

    renderBuildingOptions()

})



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('select-building').addEventListener('change', handleBuildingChange)

    document.getElementById('select-floor').addEventListener('change', handleFloorChange)

    document.getElementById('search-room').addEventListener('input', renderRoomList)

    document.getElementById('btn-save-rooms').addEventListener('click', saveRooms)

}



/*
|--------------------------------------------------------------------------
| LOAD LOCATION
|--------------------------------------------------------------------------
*/

async function loadLocationTree() {

    const response = await fetch(
        '/user/master-data/location'
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    locationTree = result.data || []

}



/*
|--------------------------------------------------------------------------
| LOAD ASSIGNED ROOMS
|--------------------------------------------------------------------------
*/

async function loadAssignedRooms() {

    const response = await fetch(
        `/user/periodic-work/jobs/${JOB_ID}/rooms`
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    assignedRooms = result.data || []

    selectedRoomIds =
        assignedRooms.map(
            item => Number(item.room_id)
        )

    renderAssignedRooms()

    renderSelectedCount()

}



/*
|--------------------------------------------------------------------------
| BUILDING
|--------------------------------------------------------------------------
*/

function renderBuildingOptions() {

    const select =
        document.getElementById(
            'select-building'
        )

    select.innerHTML = `
        <option value="">
            Select Building
        </option>
    `

    locationTree.forEach(building => {

        select.innerHTML += `
            <option value="${building.building_id}">
                ${building.building_name}
            </option>
        `

    })

}



function handleBuildingChange(e) {

    const buildingId = e.target.value

    currentBuilding =
        locationTree.find(
            b =>
                String(b.building_id)
                ===
                String(buildingId)
        )

    currentFloor = null

    renderFloorOptions()

    clearRoomList()

}



/*
|--------------------------------------------------------------------------
| FLOOR
|--------------------------------------------------------------------------
*/

function renderFloorOptions() {

    const select =
        document.getElementById(
            'select-floor'
        )

    select.innerHTML = `
        <option value="">
            Select Floor
        </option>
    `

    if (!currentBuilding) {
        return
    }

    currentBuilding.floors.forEach(floor => {

        select.innerHTML += `
            <option value="${floor.floor_id}">
                ${floor.floor_name}
            </option>
        `

    })

}



function handleFloorChange(e) {

    const floorId = e.target.value

    currentFloor =
        currentBuilding.floors.find(
            f =>
                String(f.floor_id)
                ===
                String(floorId)
        )

    renderRoomList()

}



/*
|--------------------------------------------------------------------------
| ROOM LIST
|--------------------------------------------------------------------------
*/

function renderRoomList() {

    const container =
        document.getElementById(
            'room-checkbox-list'
        )

    container.innerHTML = ''

    if (!currentFloor) {
        return
    }

    const keyword =
        document.getElementById(
            'search-room'
        )
            .value
            .trim()
            .toLowerCase()

    let rooms = currentFloor.rooms || []

    if (keyword) {

        rooms = rooms.filter(room => {

            return (
                room.room_code
                    .toLowerCase()
                    .includes(keyword)

                ||

                room.room_name
                    .toLowerCase()
                    .includes(keyword)
            )

        })

    }

    if (!rooms.length) {

        container.innerHTML = `
            <div class="empty-data">
                No rooms found
            </div>
        `

        return

    }

    rooms.forEach(room => {

        const checked =
            selectedRoomIds.includes(
                Number(room.room_id)
            )

        container.innerHTML += `<div class="room">
            <label class="room-checkbox-item room-checkbox">
                ${room.room_code} - ${room.room_name}
                <input
                    type="checkbox"
                    value="${room.room_id}"
                    ${checked ? 'checked' : ''}
                    onchange="
                        toggleRoomSelection(
                            ${room.room_id},
                            this.checked
                        )
                    "
                >

              
            </label>
        </div>
        `

    })

}



/*
|--------------------------------------------------------------------------
| TOGGLE ROOM
|--------------------------------------------------------------------------
*/

function toggleRoomSelection(
    roomId,
    checked
) {

    roomId = Number(roomId)

    if (checked) {

        if (
            !selectedRoomIds.includes(roomId)
        ) {

            selectedRoomIds.push(roomId)

        }

    } else {

        selectedRoomIds =
            selectedRoomIds.filter(
                id => id !== roomId
            )

    }

    renderSelectedCount()

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveRooms() {

    const response = await fetch(
        `/admin/periodic-work/jobs/${JOB_ID}/rooms`,
        {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json'
            },
            body: JSON.stringify({
                room_ids: selectedRoomIds
            })
        }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadAssignedRooms()

}



/*
|--------------------------------------------------------------------------
| ASSIGNED ROOMS
|--------------------------------------------------------------------------
*/

function renderAssignedRooms() {

    const container = document.getElementById('assigned-room-list')

    container.innerHTML = ''

    if (!assignedRooms.length) {

        container.innerHTML = `
            <div class="empty-data">
                No assigned rooms
            </div>
        `

        return

    }

    assignedRooms.forEach(room => {

        container.innerHTML += `
            <div class="assigned-room-item room-grid">

                <div class="room">
                <span> ${room.room_code} - ${room.room_name}</span>
                <button class="btn btn-danger" onclick="removeAssignedRoom(${room.room_id})" >  Remove                  </button>
             </div>  
            </div>
        `

    })

}



/*
|--------------------------------------------------------------------------
| REMOVE
|--------------------------------------------------------------------------
*/

async function removeAssignedRoom(roomId) {

    const response = await fetch(
        `/admin/periodic-work/jobs/${JOB_ID}/rooms/${roomId}`,
        {
            method: 'DELETE'
        }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadAssignedRooms()

}



/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function renderSelectedCount() {

    document.getElementById(
        'selected-room-count'
    ).innerText = `
        ${selectedRoomIds.length}
        rooms selected
    `

}



function clearRoomList() {

    document.getElementById(
        'room-checkbox-list'
    ).innerHTML = ''

}