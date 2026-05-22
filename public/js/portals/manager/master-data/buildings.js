// public/js/portals/manager/master-data/buildings.js

let buildings = []

let deleteId = null



document.addEventListener('DOMContentLoaded', async () => {

    bindEvents()

    await loadBuildings()

})



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {
    document.getElementById('btn-add-building').addEventListener('click', openCreateDrawer)
    document.getElementById('btn-save-building').addEventListener('click', saveBuilding)
    document.getElementById('btn-close-building-drawer').addEventListener('click', closeDrawer)
}
/*
|--------------------------------------------------------------------------
| LOAD
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
        renderBuildings()

    } catch (error) {

        console.error(error)

        showError('Không thể tải danh sách tòa nhà')

    }

}

/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderBuildings() {
    const tbody = document.getElementById('building-table-body')
    tbody.innerHTML = ''



    buildings.forEach((item, index) => {

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
                            class="btn btn-success"
                            onclick="editBuilding(${item.id})"
                        >
                            Sửa
                        </button>

                        <button
                            class="btn btn-danger
                                ${deleteId == item.id ? 'btn-dark' : ''
            }
                            "
                            onclick="handleDeleteBuilding(${item.id})"
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
    document.getElementById('building-drawer-title').innerText = 'Create Building'
    document.getElementById('building-drawer').classList.add('open')

}

function closeDrawer() {

    document.getElementById('building-drawer').classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editBuilding(id) {

    try {

        const response = await fetch(
            `/admin/master-data/building/${id}`
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        const item = result.data



        document.getElementById('building-id').value = item.id
        document.getElementById('building-code').value = item.code || ''
        document.getElementById('building-name').value = item.name || ''
        document.getElementById('building-description').value = item.description || ''
        document.getElementById('building-sort-order').value = item.sort_order || 0
        document.getElementById('building-drawer-title').innerText = 'Edit Building'
        document.getElementById('building-drawer').classList.add('open')

    } catch (error) {

        console.error(error)

        showError('Cannot load building detail')

    }

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveBuilding() {

    try {

        const id = document.getElementById('building-id').value



        const payload = {

            code: document.getElementById('building-code').value.trim(),
            name: document.getElementById('building-name').value.trim(),
            description: document.getElementById('building-description').value.trim(),
            sort_order: document.getElementById('building-sort-order').value

        }

        let response = null



        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if (id) {

            response = await fetch(
                `/admin/master-data/building/${id}`,
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
                '/admin/master-data/building',
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

            showError(result.message)

            return

        }



        showSuccess(result.message)



        closeDrawer()

        await loadBuildings()

    } catch (error) {

        console.error(error)

        showError('Cannot save building')

    }

}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteBuilding(id) {

    /*
    |--------------------------------------------------------------------------
    | FIRST CLICK
    |--------------------------------------------------------------------------
    */

    if (deleteId !== id) {

        deleteId = id

        renderBuildings()



        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderBuildings()

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
            `/admin/master-data/building/${id}`,
            {
                method: 'DELETE'
            }
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        showToast('success', result.message)



        deleteId = null

        await loadBuildings()

    } catch (error) {

        console.error(error)

        showError('Cannot delete building')

    }

}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document.getElementById('building-id').value = ''
    document.getElementById('building-code').value = ''
    document.getElementById('building-name').value = ''
    document.getElementById('building-description').value = ''
    document.getElementById('building-sort-order').value = 0

}