// public/js/portals/manager/roles/roles.js

let roles = []

let permissions = []

let selectedRole = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadPermissions()

        await loadRoles()

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
            'btn-add-role'
        )
        .addEventListener(
            'click',
            openCreateDrawer
        )



    document
        .getElementById(
            'btn-close-role-drawer'
        )
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById(
            'btn-cancel-role'
        )
        .addEventListener(
            'click',
            closeDrawer
        )



    document
        .getElementById(
            'btn-save-role'
        )
        .addEventListener(
            'click',
            saveRole
        )



    document
        .getElementById(
            'btn-save-permissions'
        )
        .addEventListener(
            'click',
            savePermissions
        )

}



/*
|--------------------------------------------------------------------------
| LOAD ROLES
|--------------------------------------------------------------------------
*/

async function loadRoles() {

    try {

        const response = await fetch(
            '/admin/roles'
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        roles = result.data || []



        renderRoles()

    } catch (err) {

        console.error(err)

        showError('Cannot load roles')

    }

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

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        permissions = result.data || []

    } catch (err) {

        console.error(err)

        showError('Cannot load permissions')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER ROLES
|--------------------------------------------------------------------------
*/

function renderRoles() {

    const tbody =
        document.getElementById(
            'role-table-body'
        )



    tbody.innerHTML = ''



    roles.forEach((item, index) => {

        const isSelected =
            selectedRole?.id == item.id



        tbody.innerHTML += `
            <tr
                class="
                    role-row
                    ${isSelected
                ? 'active-row'
                : ''
            }
                "

            >

                <td>
                    ${index + 1}
                </td>

                <td>

                    <div class="role-name">
                        ${item.name}
                    </div>

                    <div class="role-code">
                        ${item.code}
                    </div>

                </td>

                <td>

                    <span class="permission-count-badge">
                        ${item.permission_count}
                    </span>

                </td>

                <td>

                    ${item.is_system
                ? `
                            <span class="status-badge success">
                                System
                            </span>
                        `
                : '-'
            }

                </td>

                <td>

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"

                            onclick="
                                event.stopPropagation();
                                editRole(${item.id})
                            "
                        >
                            Edit
                        </button>
                        <button
                            class="btn-table-view"

                            onclick="
                                event.stopPropagation();
                                selectRole(${item.id})
                            "
                        >
                            Permissions
                        </button>
                    </div>

                </td>

            </tr>
        `

    })

}



/*
|--------------------------------------------------------------------------
| SELECT ROLE
|--------------------------------------------------------------------------
*/

async function selectRole(id) {

    try {

        const response = await fetch(
            `/admin/roles/${id}`
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        selectedRole = result.data



        renderRoles()

        renderPermissionMatrix()

    } catch (err) {

        console.error(err)

        showError('Cannot load role detail')

    }

}



/*
|--------------------------------------------------------------------------
| PERMISSION MATRIX
|--------------------------------------------------------------------------
*/

function renderPermissionMatrix() {

    if (!selectedRole) {
        return
    }



    document
        .getElementById(
            'permission-role-name'
        )
        .innerHTML = `

            <div class="permission-role-title">
                ${selectedRole.name}
            </div>

            <div class="permission-role-subtitle">

                Editing permissions for:

                <strong>
                    ${selectedRole.code}
                </strong>

            </div>

        `



    const container =
        document.getElementById(
            'permission-container'
        )



    /*
    |--------------------------------------------------------------------------
    | GROUP BY MODULE
    |--------------------------------------------------------------------------
    */

    const grouped = {}



    permissions.forEach(item => {

        if (!grouped[item.module_key]) {

            grouped[item.module_key] = []

        }



        grouped[item.module_key].push(item)

    })



    container.innerHTML = ''



    Object.keys(grouped).forEach(moduleKey => {

        const modulePermissions =
            grouped[moduleKey]



        container.innerHTML += `

            <div class="permission-module">

                <div class="permission-module-title">

                    ${formatModuleKey(moduleKey)}

                </div>

                <div class="permission-grid">

                    ${modulePermissions.map(item => `

                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                class="permission-checkbox"
                                value="${item.id}"

                                ${selectedRole.permission_ids.includes(item.id)
                ? 'checked'
                : ''
            }
                            >

                            <span>
                                ${formatActionKey(item.action_key)}
                            </span>

                        </label>

                    `).join('')}

                </div>

            </div>

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
            'role-drawer-title'
        )
        .innerText = 'Create Role'



    document
        .getElementById(
            'role-code'
        )
        .disabled = false



    document
        .getElementById(
            'role-drawer'
        )
        .classList.add('open')

}



function closeDrawer() {

    document
        .getElementById(
            'role-drawer'
        )
        .classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT ROLE
|--------------------------------------------------------------------------
*/

async function editRole(id) {

    try {

        const response = await fetch(
            `/admin/roles/${id}`
        )

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        const item = result.data



        resetForm()



        document
            .getElementById(
                'role-id'
            )
            .value = item.id



        document
            .getElementById(
                'role-code'
            )
            .value = item.code || ''



        document
            .getElementById(
                'role-name'
            )
            .value = item.name || ''



        document
            .getElementById(
                'role-description'
            )
            .value = item.description || ''



        /*
        |--------------------------------------------------------------------------
        | SYSTEM ROLE
        |--------------------------------------------------------------------------
        */

        document
            .getElementById(
                'role-code'
            )
            .disabled = item.is_system



        document
            .getElementById(
                'role-drawer-title'
            )
            .innerText = 'Edit Role'



        document
            .getElementById(
                'role-drawer'
            )
            .classList.add('open')

    } catch (err) {

        console.error(err)

        showError('Cannot load role detail')

    }

}



/*
|--------------------------------------------------------------------------
| SAVE ROLE
|--------------------------------------------------------------------------
*/

async function saveRole() {

    try {

        const id =
            document
                .getElementById(
                    'role-id'
                )
                .value



        const payload = {

            code:
                document
                    .getElementById(
                        'role-code'
                    )
                    .value
                    .trim(),

            name:
                document
                    .getElementById(
                        'role-name'
                    )
                    .value
                    .trim(),

            description:
                document
                    .getElementById(
                        'role-description'
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
                `/admin/roles/${id}`,
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
                '/admin/roles',
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

        await loadRoles()

    } catch (err) {

        console.error(err)

        showError('Cannot save role')

    }

}



/*
|--------------------------------------------------------------------------
| SAVE PERMISSIONS
|--------------------------------------------------------------------------
*/

async function savePermissions() {

    try {

        if (!selectedRole) {

            showError('Please select role')

            return

        }



        const permissionIds =
            Array.from(

                document.querySelectorAll(
                    '.permission-checkbox:checked'
                )

            ).map(
                el => Number(el.value)
            )



        const response = await fetch(
            `/admin/roles/${selectedRole.id}/permissions`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    permission_ids: permissionIds
                })
            }
        )



        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        selectedRole.permission_ids =
            permissionIds



        showSuccess(
            'Permissions updated'
        )



        await loadRoles()

    } catch (err) {

        console.error(err)

        showError('Cannot save permissions')

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
            'role-id'
        )
        .value = ''



    document
        .getElementById(
            'role-code'
        )
        .value = ''



    document
        .getElementById(
            'role-name'
        )
        .value = ''



    document
        .getElementById(
            'role-description'
        )
        .value = ''

}



/*
|--------------------------------------------------------------------------
| FORMAT MODULE KEY
|--------------------------------------------------------------------------
*/

function formatModuleKey(key) {

    return key
        .replaceAll('-', ' ')
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        )

}



/*
|--------------------------------------------------------------------------
| FORMAT ACTION KEY
|--------------------------------------------------------------------------
*/

function formatActionKey(key) {

    return key
        .replaceAll('-', ' ')
        .replaceAll('_', ' ')
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        )

}