// public/js/portals/manager/master-data/room-types.js

let roomTypes = []

let deleteId = null



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
        .getElementById('btn-add-room-type')
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById('btn-save-room-type')
        .addEventListener(
            'click',
            saveRoomType
        )



    document
        .getElementById('btn-close-room-type-drawer')
        .addEventListener(
            'click',
            closeDrawer
        )

}



/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function loadRoomTypes() {

    try {

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



        renderRoomTypes()

    } catch (error) {

        console.error(error)

        showToast(
            'error',
            'Cannot load room types'
        )

    }

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderRoomTypes() {

    const tbody =
        document.getElementById(
            'room-type-table-body'
        )

    tbody.innerHTML = ''



    roomTypes.forEach((item, index) => {

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

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"
                            onclick="editRoomType(${item.id})"
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
                            onclick="handleDeleteRoomType(${item.id})"
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
            'room-type-drawer-title'
        )
        .innerText = 'Create Room Type'



    document
        .getElementById(
            'room-type-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'room-type-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editRoomType(id) {

    try {

        const response = await fetch(
            `/admin/master-data/room-type/${id}`
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
                'room-type-id'
            )
            .value = item.id



        document
            .getElementById(
                'room-type-code'
            )
            .value = item.code || ''



        document
            .getElementById(
                'room-type-name'
            )
            .value = item.name || ''



        document
            .getElementById(
                'room-type-drawer-title'
            )
            .innerText = 'Edit Room Type'



        document
            .getElementById(
                'room-type-drawer'
            )
            .classList.add('open')

    } catch (error) {

        console.error(error)

        showToast(
            'error',
            'Cannot load room type detail'
        )

    }

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveRoomType() {

    try {

        const id =
            document
                .getElementById(
                    'room-type-id'
                )
                .value



        const payload = {

            code:
                document
                    .getElementById(
                        'room-type-code'
                    )
                    .value
                    .trim(),

            name:
                document
                    .getElementById(
                        'room-type-name'
                    )
                    .value
                    .trim()

        }



        let response = null



        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if (id) {

            response = await fetch(
                `/admin/master-data/room-type/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            )

        }

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        else {

            response = await fetch(
                '/admin/master-data/room-type',
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

        await loadRoomTypes()

    } catch (error) {

        console.error(error)

        showToast(
            'error',
            'Cannot save room type'
        )

    }

}



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteRoomType(id) {

    /*
    |--------------------------------------------------------------------------
    | FIRST CLICK
    |--------------------------------------------------------------------------
    */

    if (deleteId !== id) {

        deleteId = id

        renderRoomTypes()



        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderRoomTypes()

            }

        }, 3000)

        return

    }



    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    try {

        const response = await fetch(
            `/admin/master-data/room-type/${id}`,
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

        await loadRoomTypes()

    } catch (error) {

        console.error(error)

        showToast(
            'error',
            'Cannot delete room type'
        )

    }

}



/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document
        .getElementById(
            'room-type-id'
        )
        .value = ''



    document
        .getElementById(
            'room-type-code'
        )
        .value = ''



    document
        .getElementById(
            'room-type-name'
        )
        .value = ''

}