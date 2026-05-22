// public/js/portals/manager/master-data/floors.js

let buildings = []

let floors = []

let deleteId = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadBuildings()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document
        .getElementById('btn-add-floor')
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById('btn-save-floor')
        .addEventListener(
            'click',
            saveFloor
        )



    document
        .getElementById('btn-close-floor-drawer')
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById('filter-building-id')
        .addEventListener(
            'change',
            loadFloors
        )

}



/*
|--------------------------------------------------------------------------
| LOAD BUILDINGS
|--------------------------------------------------------------------------
*/

async function loadBuildings() {

    try {

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

    } catch (error) {

        console.error(error)

    }

}



/*
|--------------------------------------------------------------------------
| RENDER BUILDINGS
|--------------------------------------------------------------------------
*/

function renderBuildingOptions() {

    const filterSelect =
        document.getElementById(
            'filter-building-id'
        )



    const drawerSelect =
        document.getElementById(
            'floor-building-id'
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
| LOAD FLOORS
|--------------------------------------------------------------------------
*/

async function loadFloors() {

    try {

        const buildingId =
            document
                .getElementById(
                    'filter-building-id'
                )
                .value



        if (!buildingId) {

            floors = []

            renderFloors()

            return

        }



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



        renderFloors()

    } catch (error) {

        console.error(error)

    }

}



/*
|--------------------------------------------------------------------------
| RENDER FLOORS
|--------------------------------------------------------------------------
*/

function renderFloors() {

    const tbody =
        document.getElementById(
            'floor-table-body'
        )

    tbody.innerHTML = ''



    floors.forEach((item, index) => {

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
                    ${item.sort_order || 0}
                </td>

                <td>

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"
                            onclick="editFloor(${item.id})"
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
                            onclick="handleDeleteFloor(${item.id})"
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
            'floor-drawer-title'
        )
        .innerText = 'Create Floor'



    document
        .getElementById(
            'floor-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'floor-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editFloor(id) {

    try {

        const response = await fetch(
            `/admin/master-data/floor/${id}`
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
                'floor-id'
            )
            .value = item.id



        document
            .getElementById(
                'floor-building-id'
            )
            .value = item.building_id



        document
            .getElementById(
                'floor-code'
            )
            .value = item.code || ''



        document
            .getElementById(
                'floor-name'
            )
            .value = item.name || ''



        document
            .getElementById(
                'floor-sort-order'
            )
            .value = item.sort_order || 0



        document
            .getElementById(
                'floor-drawer-title'
            )
            .innerText = 'Edit Floor'



        document
            .getElementById(
                'floor-drawer'
            )
            .classList.add('open')

    } catch (error) {

        console.error(error)

    }

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveFloor() {

    try {

        const id =
            document
                .getElementById(
                    'floor-id'
                )
                .value



        const payload = {

            building_id:
                document
                    .getElementById(
                        'floor-building-id'
                    )
                    .value,

            code:
                document
                    .getElementById(
                        'floor-code'
                    )
                    .value
                    .trim(),

            name:
                document
                    .getElementById(
                        'floor-name'
                    )
                    .value
                    .trim(),

            sort_order:
                document
                    .getElementById(
                        'floor-sort-order'
                    )
                    .value

        }



        let response = null



        if (id) {

            response = await fetch(
                `/admin/master-data/floor/${id}`,
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
                '/admin/master-data/floor',
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

        await loadFloors()

    } catch (error) {

        console.error(error)

    }

}



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteFloor(id) {

    if (deleteId !== id) {

        deleteId = id

        renderFloors()



        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderFloors()

            }

        }, 3000)

        return

    }



    try {

        const response = await fetch(
            `/admin/master-data/floor/${id}`,
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

        await loadFloors()

    } catch (error) {

        console.error(error)

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
            'floor-id'
        )
        .value = ''



    document
        .getElementById(
            'floor-building-id'
        )
        .value = ''



    document
        .getElementById(
            'floor-code'
        )
        .value = ''



    document
        .getElementById(
            'floor-name'
        )
        .value = ''



    document
        .getElementById(
            'floor-sort-order'
        )
        .value = 0

}