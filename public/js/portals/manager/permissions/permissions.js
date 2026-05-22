// public/js/portals/manager/permissions/permissions.js

let permissions = []



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadPermissions()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document
        .getElementById(
            'btn-add-permission'
        )
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById(
            'btn-close-permission-drawer'
        )
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById(
            'btn-cancel-permission'
        )
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById(
            'btn-save-permission'
        )
        .addEventListener(
            'click',
            savePermission
        )



    /*
    |--------------------------------------------------------------------------
    | AUTO GENERATE CODE
    |--------------------------------------------------------------------------
    */

    document
        .getElementById(
            'permission-module-key'
        )
        .addEventListener(
            'input',
            updatePermissionCode
        )



    document
        .getElementById(
            'permission-action-key'
        )
        .addEventListener(
            'input',
            updatePermissionCode
        )

}



/*
|--------------------------------------------------------------------------
| LOAD PERMISSIONS
|--------------------------------------------------------------------------
*/

async function loadPermissions() {

    try {

        const response = await fetch(
            '/admin/permissions'
        )



        const result =
            await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        permissions = result.data || []



        renderPermissions()

    } catch (err) {

        console.error(err)

        showError(
            'Cannot load permissions'
        )

    }

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderPermissions() {

    const tbody =
        document.getElementById(
            'permission-table-body'
        )



    tbody.innerHTML = ''



    permissions.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>

                    <span class="permission-module-badge">
                        ${formatText(item.module_key)}
                    </span>

                </td>

                <td>

                    <span class="permission-action-badge">
                        ${formatText(item.action_key)}
                    </span>

                </td>

                <td>

                    <code>
                        ${item.code}
                    </code>

                </td>

                <td>

                    <button
                        class="btn-table-edit"
                        onclick="editPermission(${item.id})"
                    >
                        Edit
                    </button>

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
            'permission-drawer-title'
        )
        .innerText = 'Create Permission'



    document
        .getElementById(
            'permission-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'permission-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editPermission(id) {

    try {

        const response = await fetch(
            `/admin/permissions/${id}`
        )



        const result =
            await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        const item = result.data



        resetForm()



        document
            .getElementById(
                'permission-id'
            )
            .value = item.id



        document
            .getElementById(
                'permission-module-key'
            )
            .value = item.module_key || ''



        document
            .getElementById(
                'permission-action-key'
            )
            .value = item.action_key || ''



        document
            .getElementById(
                'permission-code'
            )
            .value = item.code || ''



        document
            .getElementById(
                'permission-drawer-title'
            )
            .innerText = 'Edit Permission'



        document
            .getElementById(
                'permission-drawer'
            )
            .classList.add('open')

    } catch (err) {

        console.error(err)

        showError(
            'Cannot load permission'
        )

    }

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function savePermission() {

    try {

        const id =
            document
                .getElementById(
                    'permission-id'
                )
                .value



        const payload = {

            module_key:
                document
                    .getElementById(
                        'permission-module-key'
                    )
                    .value
                    .trim()
                    .toLowerCase(),

            action_key:
                document
                    .getElementById(
                        'permission-action-key'
                    )
                    .value
                    .trim()
                    .toLowerCase()

        }



        let response = null



        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if (id) {

            response = await fetch(
                `/admin/permissions/${id}`,
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
                '/admin/permissions',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(payload)
                }
            )

        }



        const result =
            await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        showSuccess(result.message)



        closeDrawer()

        await loadPermissions()

    } catch (err) {

        console.error(err)

        showError(
            'Cannot save permission'
        )

    }

}



/*
|--------------------------------------------------------------------------
| AUTO CODE
|--------------------------------------------------------------------------
*/

function updatePermissionCode() {

    const moduleKey =
        document
            .getElementById(
                'permission-module-key'
            )
            .value
            .trim()
            .toLowerCase()



    const actionKey =
        document
            .getElementById(
                'permission-action-key'
            )
            .value
            .trim()
            .toLowerCase()



    let code = ''



    if (
        moduleKey
        &&
        actionKey
    ) {

        code =
            `${moduleKey}.${actionKey}`

    }



    document
        .getElementById(
            'permission-code'
        )
        .value = code

}



/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document
        .getElementById(
            'permission-id'
        )
        .value = ''



    document
        .getElementById(
            'permission-module-key'
        )
        .value = ''



    document
        .getElementById(
            'permission-action-key'
        )
        .value = ''



    document
        .getElementById(
            'permission-code'
        )
        .value = ''

}



/*
|--------------------------------------------------------------------------
| FORMAT TEXT
|--------------------------------------------------------------------------
*/

function formatText(text) {

    return text
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        )

}