// public/js/portals/manager/master-data/room-type-assets.js

let roomTypes = []

let roomTypeAssets = []



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

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
        .getElementById('filter-room-type-id')
        .addEventListener(
            'change',
            loadRoomTypeAssets
        )

}



/*
|--------------------------------------------------------------------------
| LOAD ROOM TYPES
|--------------------------------------------------------------------------
*/

async function loadRoomTypes() {

    try {

        const response = await fetch(
            '/admin/master-data/room-type'
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        roomTypes = result.data || []



        renderRoomTypeOptions()

    } catch (error) {

        console.error(error)

        showError('Cannot load room types')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER ROOM TYPES
|--------------------------------------------------------------------------
*/

function renderRoomTypeOptions() {

    const select =
        document.getElementById(
            'filter-room-type-id'
        )



    select.innerHTML = `
        <option value="">
            Select Room Type
        </option>
    `



    roomTypes.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.code} - ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| LOAD ROOM TYPE ASSETS
|--------------------------------------------------------------------------
*/

async function loadRoomTypeAssets() {

    try {

        const roomTypeId =
            document
                .getElementById(
                    'filter-room-type-id'
                )
                .value



        if (!roomTypeId) {

            roomTypeAssets = []

            renderRoomTypeAssets()

            return

        }



        const response = await fetch(
            `/admin/master-data/room-type-asset?room_type_id=${roomTypeId}`
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        roomTypeAssets = result.data || []



        renderRoomTypeAssets()

    } catch (error) {

        console.error(error)

        showError('Cannot load room type assets')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderRoomTypeAssets() {

    const tbody =
        document.getElementById(
            'room-type-asset-table-body'
        )



    tbody.innerHTML = ''



    roomTypeAssets.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.code}
                </td>

                <td>
                    ${item.name}
                </td>

                <td>
                    ${item.group_name || '-'}
                </td>

                <td>

                    <label class="switch">

                        <input
                            type="checkbox"
                            ${item.checked
                ? 'checked'
                : ''
            }
                            onchange="toggleRoomTypeAsset(
                                ${item.id},
                                this.checked
                            )"
                        >

                        <span class="slider"></span>

                    </label>

                </td>

            </tr>
        `

    })

}



/*
|--------------------------------------------------------------------------
| TOGGLE
|--------------------------------------------------------------------------
*/

async function toggleRoomTypeAsset(
    assetTypeId,
    checked
) {

    try {

        const roomTypeId =
            document
                .getElementById(
                    'filter-room-type-id'
                )
                .value



        const response = await fetch(
            '/admin/master-data/room-type-asset/toggle',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    room_type_id: roomTypeId,

                    asset_type_id: assetTypeId,

                    checked

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

        showError('Cannot update room type asset')

    }

}