// public/js/portals/manager/master-data/room-names.js

let buildings = []

let floors = []

let roomNames = []



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()
        document.getElementById('filter-academic-year').value = getCurrentAcademicYear()

        await loadBuildings()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('filter-building-id').addEventListener('change', handleBuildingChange)

    document.getElementById('btn-load-room-names').addEventListener('click', loadRoomNames)

}



/*
|--------------------------------------------------------------------------
| BUILDINGS
|--------------------------------------------------------------------------
*/

async function loadBuildings() {

    try {

        const response = await fetch('/admin/master-data/building')

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        buildings = result.data || []



        renderBuildingOptions()

    } catch (error) {

        console.error(error)

        showError('Cannot load buildings')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER BUILDINGS
|--------------------------------------------------------------------------
*/

function renderBuildingOptions() {

    const select = document.getElementById('filter-building-id')

    select.innerHTML = `
        <option value="">
            Select Building
        </option>
    `



    buildings.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| BUILDING CHANGE
|--------------------------------------------------------------------------
*/

async function handleBuildingChange() {

    try {

        const buildingId = document.getElementById('filter-building-id').value
        const floorSelect = document.getElementById('filter-floor-id')
        floorSelect.innerHTML = `
            <option value="">
                Select Floor
            </option>
        `
        if (!buildingId) {
            return
        }

        const response = await fetch(`/admin/master-data/floor?building_id=${buildingId}`)
        const result = await response.json()

        if (!result.success) {

            showError(result.message)

            return

        }



        floors = result.data || []



        floors.forEach(item => {

            floorSelect.innerHTML += `
                <option value="${item.id}">
                    ${item.code} - ${item.name}
                </option>
            `

        })

    } catch (error) {

        console.error(error)

        showError('Cannot load floors')

    }

}



/*
|--------------------------------------------------------------------------
| LOAD ROOM NAMES
|--------------------------------------------------------------------------
*/

async function loadRoomNames() {

    try {

        const academicYear = document.getElementById('filter-academic-year').value.trim()
        const buildingId = document.getElementById('filter-building-id').value
        const floorId = document.getElementById('filter-floor-id').value

        const url = new URL('/admin/master-data/room-name', window.location.origin)



        if (academicYear) {

            url.searchParams.append('academic_year', academicYear)

        }



        if (buildingId) {
            url.searchParams.append('building_id', buildingId)
        }



        if (floorId) {
            url.searchParams.append('floor_id', floorId)
        }



        const response = await fetch(url)

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        roomNames = result.data || []



        renderRoomNames()

    } catch (error) {

        console.error(error)

        showError('Cannot load room names')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderRoomNames() {

    const tbody = document.getElementById('room-name-table-body')



    tbody.innerHTML = ''



    roomNames.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.room_code}
                </td>

                <td>
                    ${item.building_name}
                </td>

                <td>
                    ${item.floor_name}
                </td>

                <td>

                    <input
                        type="text"
                        class="table-input"
                        id="room-name-${item.room_id}"
                        value="${item.room_name || ''}"
                    >

                </td>

                <td>

                    <button
                        class="btn-primary btn-sm"
                        onclick="saveRoomName(${item.room_id})"
                    >
                        Save
                    </button>

                </td>

            </tr>
        `

    })

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveRoomName(roomId) {

    try {

        const academicYear = document.getElementById('filter-academic-year').value.trim()

        const roomName = document.getElementById(`room-name-${roomId}`).value.trim()

        const response = await fetch('/admin/master-data/room-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                room_id: roomId,
                academic_year: academicYear,
                room_name: roomName
            })
        })

        const result = await response.json()

        if (!result.success) {
            showError(result.message)
            return
        }

        showSuccess(result.message)

        await loadRoomNames()

    } catch (error) {

        console.error(error)

        showError('Cannot save room name')

    }

}


/*
|--------------------------------------------------------------------------
| SAVE ROOM NAME (UPDATED)
|--------------------------------------------------------------------------
*/

async function saveRoomName(roomId) {

    try {

        // Lấy giá trị năm học
        const academicYear = document.getElementById('filter-academic-year').value.trim()

        // Lấy tên phòng theo ID
        const roomName = document.getElementById(`room-name-${roomId}`).value.trim()

        const response = await fetch('/admin/master-data/room-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                room_id: roomId,

                academic_year: academicYear,

                room_name: roomName

            })

        }
        )



        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        showSuccess(result.message)

    } catch (error) {

        console.error(error)

        showError('Cannot save room name')

    }

}