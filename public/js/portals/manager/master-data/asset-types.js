// public/js/portals/manager/master-data/asset-types.js

let assetTypes = []

let deleteId = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadAssetTypes()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document
        .getElementById('btn-add-asset-type')
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById('btn-save-asset-type')
        .addEventListener(
            'click',
            saveAssetType
        )



    document
        .getElementById('btn-close-asset-type-drawer')
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

async function loadAssetTypes() {

    try {

        const response = await fetch(
            '/admin/master-data/asset'
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        assetTypes = result.data || []



        renderAssetTypes()

    } catch (error) {

        console.error(error)

        showError('Cannot load asset types')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderAssetTypes() {

    const tbody =
        document.getElementById(
            'asset-type-table-body'
        )

    tbody.innerHTML = ''



    assetTypes.forEach((item, index) => {

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

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"
                            onclick="editAssetType(${item.id})"
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
                            onclick="handleDeleteAssetType(${item.id})"
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
            'asset-type-drawer-title'
        )
        .innerText = 'Create Asset Type'



    document
        .getElementById(
            'asset-type-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'asset-type-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editAssetType(id) {

    try {

        const response = await fetch(
            `/admin/master-data/asset/${id}`
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        const item = result.data



        document
            .getElementById(
                'asset-type-id'
            )
            .value = item.id



        document
            .getElementById(
                'asset-type-code'
            )
            .value = item.code || ''



        document
            .getElementById(
                'asset-type-name'
            )
            .value = item.name || ''



        document
            .getElementById(
                'asset-type-group-name'
            )
            .value = item.group_name || ''



        document
            .getElementById(
                'asset-type-drawer-title'
            )
            .innerText = 'Edit Asset Type'



        document
            .getElementById(
                'asset-type-drawer'
            )
            .classList.add('open')

    } catch (error) {

        console.error(error)

        showError('Cannot load asset type detail')

    }

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveAssetType() {

    try {

        const id =
            document
                .getElementById(
                    'asset-type-id'
                )
                .value



        const payload = {

            code:
                document
                    .getElementById(
                        'asset-type-code'
                    )
                    .value
                    .trim(),

            name:
                document
                    .getElementById(
                        'asset-type-name'
                    )
                    .value
                    .trim(),

            group_name:
                document
                    .getElementById(
                        'asset-type-group-name'
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
                `/admin/master-data/asset/${id}`,
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
                '/admin/master-data/asset',
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

        await loadAssetTypes()

    } catch (error) {

        console.error(error)

        showError('Cannot save asset type')

    }

}



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteAssetType(id) {

    /*
    |--------------------------------------------------------------------------
    | FIRST CLICK
    |--------------------------------------------------------------------------
    */

    if (deleteId !== id) {

        deleteId = id

        renderAssetTypes()



        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderAssetTypes()

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
            `/admin/master-data/asset/${id}`,
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



        deleteId = null

        await loadAssetTypes()

    } catch (error) {

        console.error(error)

        showError('Cannot delete asset type')

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
            'asset-type-id'
        )
        .value = ''



    document
        .getElementById(
            'asset-type-code'
        )
        .value = ''



    document
        .getElementById(
            'asset-type-name'
        )
        .value = ''



    document
        .getElementById(
            'asset-type-group-name'
        )
        .value = ''

}