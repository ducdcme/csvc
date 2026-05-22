// public/js/portals/manager/users/users.js

let users = []

let roles = []

let campuses = []

let actionUserId = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadRoles()

        await loadCampus()

        await loadUsers()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('btn-add-user').addEventListener('click', openCreateDrawer)

    document.getElementById('btn-save-user').addEventListener('click', saveUser)

    document.getElementById('btn-close-user-drawer').addEventListener('click', closeDrawer)

    document.getElementById('filter-keyword').addEventListener('keyup', loadUsers)

    document.getElementById('filter-role-id').addEventListener('change', loadUsers)

    document.getElementById('filter-active').addEventListener('change', loadUsers)

}



/*
|--------------------------------------------------------------------------
| LOAD USERS
|--------------------------------------------------------------------------
*/

async function loadUsers() {

    try {

        const keyword = document.getElementById('filter-keyword').value.trim()



        const roleId = document.getElementById('filter-role-id').value



        const isActive = document.getElementById('filter-active').value



        const url = new URL('/admin/user', window.location.origin)



        if (keyword) {

            url.searchParams.append('keyword', keyword)

        }



        if (roleId) {

            url.searchParams.append('role_id', roleId)

        }



        if (isActive !== '') {

            url.searchParams.append('is_active', isActive)

        }



        const response = await fetch(url)

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        users = result.data || []



        renderUsers()

    } catch (error) {

        console.error(error)

        showError('Cannot load users')

    }

}



/*
|--------------------------------------------------------------------------
| LOAD ROLES
|--------------------------------------------------------------------------
*/

async function loadRoles() {

    try {

        const response = await fetch('/admin/roles')

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        roles = result.data || []



        renderRoleFilter()

        renderRoleCheckboxes()

    } catch (error) {

        console.error(error)

        showError('Cannot load roles')

    }

}



/*
|--------------------------------------------------------------------------
| LOAD CAMPUSES
|--------------------------------------------------------------------------
*/

async function loadCampus() {

    try {

        const response = await fetch('/admin/campus')

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        campuses = result.data || []



        renderCampusCheckboxes()

    } catch (error) {

        console.error(error)

        showError('Cannot load campuses')

    }

}



/*
|--------------------------------------------------------------------------
| RENDER USERS
|--------------------------------------------------------------------------
*/

function renderUsers() {

    const tbody = document.getElementById('user-table-body')



    tbody.innerHTML = ''



    users.forEach((item, index) => {

        const roleNames =
            (item.roles || [])
                .map(role => role.name)
                .join(', ')



        const campusNames =
            (item.campuses || [])
                .map(campus => campus.name)
                .join(', ')



        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.username}
                </td>

                <td>
                    ${item.full_name || '-'}
                </td>

                <td>
                    ${roleNames || '-'}
                </td>

                <td>
                    ${campusNames || '-'}
                </td>

                <td>
                    ${item.last_login_at
                ? formatDateTime(item.last_login_at)
                : '-'
            }
                </td>

                <td>

                    <span class="
                        status-badge
                        ${item.is_active
                ? 'success'
                : 'danger'
            }
                    ">

                        ${item.is_active
                ? 'Active'
                : 'Inactive'
            }

                    </span>

                </td>

                <td>

                    <div class="table-action-group">

                        <button
                            class="btn-table-edit"
                            onclick="editUser(${item.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-table-warning"
                            onclick="resetPassword(${item.id})"
                        >
                            Reset Password
                        </button>

                        <button
                            class="
                                ${item.is_active
                ? 'btn-table-delete'
                : 'btn-table-success'
            }
                            "
                            onclick="toggleActive(${item.id})"
                        >
                            ${item.is_active
                ? 'Disable'
                : 'Enable'
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
| ROLE FILTER
|--------------------------------------------------------------------------
*/

function renderRoleFilter() {

    const select = document.getElementById('filter-role-id')



    select.innerHTML = `
        <option value="">
            All Roles
        </option>
    `



    roles.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| ROLE CHECKBOXES
|--------------------------------------------------------------------------
*/

function renderRoleCheckboxes() {

    const container =
        document.getElementById(
            'role-checkbox-list'
        )



    container.innerHTML = ''



    roles.forEach(item => {

        container.innerHTML += `
            <label class="checkbox-item">

                <input
                    type="checkbox"
                    class="role-checkbox"
                    value="${item.id}"
                >

                <span>
                    ${item.name}
                </span>

            </label>
        `

    })

}



/*
|--------------------------------------------------------------------------
| CAMPUS CHECKBOXES
|--------------------------------------------------------------------------
*/

function renderCampusCheckboxes() {

    const container = document.getElementById('campus-checkbox-list')



    container.innerHTML = ''



    campuses.forEach(item => {

        container.innerHTML += `
            <label class="checkbox-item">

                <input
                    type="checkbox"
                    class="campus-checkbox"
                    value="${item.id}"
                >

                <span>
                    ${item.name}
                </span>

            </label>
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



    document.getElementById('user-drawer-title').innerText = 'Create User'



    document.getElementById('password-group').style.display = 'block'



    document.getElementById('user-username').disabled = false



    document.getElementById('user-drawer').classList.add('open')

}



function closeDrawer() {

    document.getElementById('user-drawer').classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT USER
|--------------------------------------------------------------------------
*/

async function editUser(id) {

    try {

        const response = await fetch(`/admin/user/${id}`)

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        const item = result.data



        resetForm()



        document.getElementById('user-id').value = item.id



        document.getElementById('user-username').value = item.username || ''



        document.getElementById('user-full-name').value = item.full_name || ''



        document.getElementById('user-email').value = item.email || ''



        document.getElementById('user-phone').value = item.phone || ''



        document.getElementById('user-active').checked = item.is_active



        /*
        |--------------------------------------------------------------------------
        | HIDE PASSWORD
        |--------------------------------------------------------------------------
        */

        document.getElementById('password-group').style.display = 'none'



        /*
        |--------------------------------------------------------------------------
        | DISABLE USERNAME
        |--------------------------------------------------------------------------
        */

        document.getElementById('user-username').disabled = true


        /*
        |--------------------------------------------------------------------------
        | ROLE CHECKBOX
        |--------------------------------------------------------------------------
        */

        document.querySelectorAll('.role-checkbox').forEach(el => {

            el.checked = item.role_ids
                .map(Number)
                .includes(Number(el.value))

        })



        /*
        |--------------------------------------------------------------------------
        | CAMPUS CHECKBOX
        |--------------------------------------------------------------------------
        */

        document.querySelectorAll('.campus-checkbox').forEach(el => {

            el.checked = item.campus_ids
                .map(Number)
                .includes(Number(el.value))

        })



        document.getElementById('user-drawer-title').innerText = 'Edit User'



        document.getElementById('user-drawer').classList.add('open')

    } catch (error) {

        console.error(error)

        showError('Cannot load user detail')

    }

}



/*
|--------------------------------------------------------------------------
| SAVE USER
|--------------------------------------------------------------------------
*/

async function saveUser() {

    try {

        const id =
            document
                .getElementById(
                    'user-id'
                )
                .value



        const roleIds =
            Array.from(document.querySelectorAll('.role-checkbox:checked')).map(el => Number(el.value))



        const campusIds = Array.from(document.querySelectorAll('.campus-checkbox:checked')).map(el => Number(el.value))



        const payload = {

            username: document.getElementById('user-username').value.trim(),

            password: document.getElementById('user-password').value.trim(),

            full_name: document.getElementById('user-full-name').value.trim(),

            email: document.getElementById('user-email').value.trim(),

            phone: document.getElementById('user-phone').value.trim(),

            is_active: document.getElementById('user-active').checked,

            role_ids: roleIds,

            campus_ids: campusIds

        }



        let response = null



        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        if (id) {

            response = await fetch(`/admin/user/${id}`, {
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

            response = await fetch('/admin/user', {
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

        await loadUsers()

    } catch (error) {

        console.error(error)

        showError('Cannot save user')

    }

}



/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

async function resetPassword(id) {

    try {

        const response = await fetch(`/admin/user/${id}/reset-password`, { method: 'POST' })

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        showSuccess(result.message)

    } catch (error) {

        console.error(error)

        showError('Cannot reset password')

    }

}



/*
|--------------------------------------------------------------------------
| TOGGLE ACTIVE
|--------------------------------------------------------------------------
*/

async function toggleActive(id) {

    try {

        const response = await fetch(`/admin/user/${id}/toggle-active`, { method: 'POST' })

        const result = await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }



        showSuccess(result.message)



        await loadUsers()

    } catch (error) {

        console.error(error)

        showError('Cannot update user status')

    }

}



/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document.getElementById('user-id').value = ''



    document.getElementById('user-username').value = ''



    document.getElementById('user-password').value = ''



    document.getElementById('user-full-name').value = ''



    document.getElementById('user-email').value = ''



    document.getElementById('user-phone').value = ''



    document.getElementById('user-active').checked = true



    document.querySelectorAll('.role-checkbox').forEach(el => {

        el.checked = false

    })



    document.querySelectorAll('.campus-checkbox').forEach(el => {

        el.checked = false

    })

}



/*
|--------------------------------------------------------------------------
| FORMAT DATETIME
|--------------------------------------------------------------------------
*/

function formatDateTime(dateString) {

    const date = new Date(dateString)

    return date.toLocaleString()

}