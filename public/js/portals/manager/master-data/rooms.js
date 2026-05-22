// public/js/portals/manager/master-data/rooms.js

let buildings = []

let floors = []

let roomTypes = []

let rooms = []

let deleteId = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadBuildings()

        await loadRoomTypes()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document
        .getElementById('btn-add-room')
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById('btn-save-room')
        .addEventListener(
            'click',
            saveRoom
        )



    document
        .getElementById('btn-close-room-drawer')
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById('filter-building-id')
        .addEventListener(
            'change',
            handleFilterBuildingChange
        )



    document
        .getElementById('filter-floor-id')
        .addEventListener(
            'change',
            loadRooms
        )



    document
        .getElementById('filter-room-type-id')
        .addEventListener(
            'change',
            loadRooms
        )



    document
        .getElementById('filter-keyword')
        .addEventListener(
            'keyup',
            loadRooms
        )



    document
        .getElementById('room-building-id')
        .addEventListener(
            'change',
            handleDrawerBuildingChange
        )

}



/*
|--------------------------------------------------------------------------
| BUILDINGS
|--------------------------------------------------------------------------
*/

async function loadBuildings() {

    const response = await fetch(
        '/admin/master-data/building'
    )

    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }

    buildings = result.data || []

    renderBuildingOptions()

}



function renderBuildingOptions() {

    const filterSelect =
        document.getElementById(
            'filter-building-id'
        )



    const drawerSelect =
        document.getElementById(
            'room-building-id'
        )



    filterSelect.innerHTML = `
        <option value="">
            Select Building
        </option>
    `



    drawerSelect.innerHTML = `
        <option value="">
            Select Building
        </option>
    `



    buildings.forEach(item => {

        filterSelect.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `



        drawerSelect.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| FLOORS
|--------------------------------------------------------------------------
*/

async function loadFloors(buildingId) {

    const response = await fetch(
        `/admin/master-data/floor?building_id=${buildingId}`
    )

    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }

    floors = result.data || []

}



/*
|--------------------------------------------------------------------------
| ROOM TYPES
|--------------------------------------------------------------------------
*/

async function loadRoomTypes() {

    const response = await fetch(
        '/admin/master-data/room-type'
    )

    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }

    roomTypes = result.data || []

    renderRoomTypeOptions()

}



function renderRoomTypeOptions() {

    const filterSelect =
        document.getElementById(
            'filter-room-type-id'
        )



    const drawerSelect =
        document.getElementById(
            'room-room-type-id'
        )



    roomTypes.forEach(item => {

        filterSelect.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `



        drawerSelect.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| FILTER BUILDING CHANGE
|--------------------------------------------------------------------------
*/

async function handleFilterBuildingChange() {

    const buildingId =
        document
            .getElementById(
                'filter-building-id'
            )
            .value



    const floorSelect =
        document.getElementById(
            'filter-floor-id'
        )



    floorSelect.innerHTML = `
        <option value="">
            Select Floor
        </option>
    `



    if (!buildingId) {

        rooms = []

        renderRooms()

        return

    }



    await loadFloors(buildingId)



    floors.forEach(item => {

        floorSelect.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| DRAWER BUILDING CHANGE
|--------------------------------------------------------------------------
*/

async function handleDrawerBuildingChange() {

    const buildingId =
        document
            .getElementById(
                'room-building-id'
            )
            .value



    const floorSelect =
        document.getElementById(
            'room-floor-id'
        )



    floorSelect.innerHTML = `
        <option value="">
            Select Floor
        </option>
    `



    if (!buildingId) {
        return
    }



    await loadFloors(buildingId)



    floors.forEach(item => {

        floorSelect.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| LOAD ROOMS
|--------------------------------------------------------------------------
*/

async function loadRooms() {

    const floorId =
        document
            .getElementById(
                'filter-floor-id'
            )
            .value



    if (!floorId) {

        rooms = []

        renderRooms()

        return

    }



    const roomTypeId =
        document
            .getElementById(
                'filter-room-type-id'
            )
            .value



    const keyword =
        document
            .getElementById(
                'filter-keyword'
            )
            .value



    const url = new URL(
        '/admin/master-data/room',
        window.location.origin
    )



    url.searchParams.append(
        'floor_id',
        floorId
    )



    if (roomTypeId) {

        url.searchParams.append(
            'room_type_id',
            roomTypeId
        )

    }



    if (keyword) {

        url.searchParams.append(
            'keyword',
            keyword
        )

    }



    const response = await fetch(url)

    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }

    rooms = result.data || []

    renderRooms()

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderRooms() {

    const tbody =
        document.getElementById(
            'room-table-body'
        )

    tbody.innerHTML = ''



    rooms.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.code}
                </td>

                <td>
                    ${item.current_room_name || '-'}
                </td>

                <td>
                    ${item.room_type_name || '-'}
                </td>

                <td>
                    ${item.floor_name}
                </td>

                <td>
                    ${item.building_name}
                </td>

                <td>

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"
                            onclick="editRoom(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="
                                btn-table-delete
                                ${deleteId == item.id
                ? 'confirm'
                : ''
            }
                            "
                            onclick="handleDeleteRoom(${item.id})"
                        >
                            ${deleteId == item.id
                ? 'Confirm ?'
                : 'Delete'
            }
                        </button>

                    </div>

                </td>

            </tr>
        `

    })

}



/*
|--------------------------------------------------------------------------
| DRAWER
|--------------------------------------------------------------------------
*/

function openCreateDrawer() {

    resetForm()

    document
        .getElementById(
            'room-drawer-title'
        )
        .innerText = 'Create Room'



    document
        .getElementById(
            'room-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'room-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editRoom(id) {

    const response = await fetch(
        `/admin/master-data/room/${id}`
    )

    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }



    const item = result.data



    document
        .getElementById(
            'room-id'
        )
        .value = item.id



    document
        .getElementById(
            'room-building-id'
        )
        .value = item.building_id



    await handleDrawerBuildingChange()



    document
        .getElementById(
            'room-floor-id'
        )
        .value = item.floor_id



    document
        .getElementById(
            'room-room-type-id'
        )
        .value = item.room_type_id || ''



    document
        .getElementById(
            'room-code'
        )
        .value = item.code || ''



    document
        .getElementById(
            'room-name'
        )
        .value = item.name || ''



    document
        .getElementById(
            'room-drawer-title'
        )
        .innerText = 'Edit Room'



    document
        .getElementById(
            'room-drawer'
        )
        .classList.add('open')

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveRoom() {

    const id =
        document
            .getElementById(
                'room-id'
            )
            .value



    const payload = {

        building_id:
            document
                .getElementById(
                    'room-building-id'
                )
                .value,

        floor_id:
            document
                .getElementById(
                    'room-floor-id'
                )
                .value,

        room_type_id:
            document
                .getElementById(
                    'room-room-type-id'
                )
                .value || null,

        code:
            document
                .getElementById(
                    'room-code'
                )
                .value
                .trim(),

        name:
            document
                .getElementById(
                    'room-name'
                )
                .value
                .trim()

    }



    let response = null



    if (id) {

        response = await fetch(
            `/admin/master-data/room/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        )

    } else {

        response = await fetch(
            '/admin/master-data/room',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        )

    }



    const result = await response.json()

    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }



    showToast(
        'success',
        result.message
    )



    closeDrawer()

    await loadRooms()

}



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteRoom(id) {

    if (deleteId !== id) {

        deleteId = id

        renderRooms()



        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderRooms()

            }

        }, 3000)

        return

    }



    const response = await fetch(
        `/admin/master-data/room/${id}`,
        {
            method: 'DELETE'
        }
    )

    const result = await response.json()



    if (!result.success) {

        showToast(
            'error',
            result.message
        )

        return

    }



    showToast(
        'success',
        result.message
    )



    deleteId = null

    await loadRooms()

}



/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document
        .getElementById(
            'room-id'
        )
        .value = ''



    document
        .getElementById(
            'room-building-id'
        )
        .value = ''



    document
        .getElementById(
            'room-floor-id'
        )
        .innerHTML = `
            <option value="">
                Select Floor
            </option>
        `



    document
        .getElementById(
            'room-room-type-id'
        )
        .value = ''



    document
        .getElementById(
            'room-code'
        )
        .value = ''



    document
        .getElementById(
            'room-name'
        )
        .value = ''

}