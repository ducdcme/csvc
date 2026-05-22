let types = []

let definitions = []

let deleteId = null



document.addEventListener(
    'DOMContentLoaded',
    async () => {

        bindEvents()

        await loadTypes()

        await loadDefinitions()

    }
)



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('btn-add-definition').addEventListener('click', openCreateDrawer)


    document.getElementById('btn-close-definition-drawer').addEventListener('click', closeDrawer)


    document.getElementById('btn-save-definition').addEventListener('click', saveDefinition)


    document.getElementById('filter-type-id').addEventListener('change', loadDefinitions)


    document.getElementById('filter-status').addEventListener('change', loadDefinitions)


    document.getElementById('filter-keyword').addEventListener('keyup', loadDefinitions)

}



/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

async function loadTypes() {

    const response = await fetch(
        '/admin/periodic-work/types'
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    types = result.data || []

    renderTypeOptions()

}



function renderTypeOptions() {

    const filterSelect = document.getElementById('filter-type-id')

    const drawerSelect = document.getElementById('definition-type-id')


    filterSelect.innerHTML = `
        <option value="">
            All Types
        </option>
    `
    drawerSelect.innerHTML = `
        <option value="">
            Select Type
        </option>
    `

    types.forEach(item => {

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
| LOAD DEFINITIONS
|--------------------------------------------------------------------------
*/

async function loadDefinitions() {

    const typeId = document.getElementById('filter-type-id').value


    const status = document.getElementById('filter-status').value


    const keyword = document.getElementById('filter-keyword').value


    const url = new URL('/admin/periodic-work/definitions', window.location.origin)


    if (typeId) {

        url.searchParams.append('type_id', typeId)

    }


    if (status) {

        url.searchParams.append('status', status)

    }


    if (keyword) {

        url.searchParams.append('keyword', keyword)

    }


    const response = await fetch(url)

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }


    definitions = result.data || []

    renderDefinitions()

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderDefinitions() {

    const tbody = document.getElementById('definition-table-body')


    tbody.innerHTML = ''


    definitions.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${item.title}
                </td>

                <td>
                    ${item.type_name}
                </td>

                <td>
                    ${item.cycle_value} ${item.cycle_unit}
                </td>

                <td>
                    ${formatDate(item.first_due_date)}
                </td>

                <td>
                    ${item.requires_result_file ? 'YES' : 'NO'}
                </td>

                <td>
                    <span class="badge ${item.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}">
                        ${item.status}
                    </span>
                </td>

                <td>

                    <div class="table-action-group">

                        <button class="btn btn-primary" onclick="editDefinition(${item.id})">Edit</button>

                        <button class="btn btn-warning" onclick="toggleDefinitionStatus(${item.id}, '${item.status}')">
                            ${item.status === 'ACTIVE' ? 'Disable' : 'Enable'}
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

    document.getElementById('definition-drawer-title').innerText = 'Create Definition'


    document.getElementById('definition-drawer').classList.add('open')

}



function closeDrawer() {

    document.getElementById('definition-drawer').classList.remove('open')

}



/*
|--------------------------------------------------------------------------
| EDIT
|--------------------------------------------------------------------------
*/

async function editDefinition(id) {
    const numberId = Number(id)

    const response = await fetch(`/admin/periodic-work/definitions/${numberId}`)

    const result = await response.json()


    if (!result.success) {

        showError(result.message)

        return

    }


    const item = result.data


    document.getElementById('definition-id').value = item.id


    document.getElementById('definition-title').value = item.title || ''


    document.getElementById('definition-type-id').value = item.periodic_work_type_id


    document.getElementById('definition-cycle-unit').value = item.cycle_unit


    document.getElementById('definition-cycle-value').value = item.cycle_value


    document.getElementById('definition-first-due-date').value = formatInputDate(item.first_due_date)


    document.getElementById('definition-active-from').value = formatInputDate(item.active_from)


    document.getElementById('definition-active-to').value = formatInputDate(item.active_to)


    document.getElementById('definition-status').value = item.status


    document.getElementById('definition-requires-result-file').checked = item.requires_result_file


    document.getElementById('definition-drawer-title').innerText = 'Edit Definition'


    document.getElementById('definition-drawer').classList.add('open')

}



/*
|--------------------------------------------------------------------------
| SAVE
|--------------------------------------------------------------------------
*/

async function saveDefinition() {

    const id = document.getElementById('definition-id').value


    const payload = {

        title: document.getElementById('definition-title').value.trim(),


        periodic_work_type_id: document.getElementById('definition-type-id').value,


        cycle_unit: document.getElementById('definition-cycle-unit').value,


        cycle_value: Number(document.getElementById('definition-cycle-value').value),


        first_due_date: document.getElementById('definition-first-due-date').value,


        active_from: document.getElementById('definition-active-from').value || null,


        active_to: document.getElementById('definition-active-to').value || null,


        status: document.getElementById('definition-status').value,


        requires_result_file: document.getElementById('definition-requires-result-file').checked

    }


    let response = null


    if (id) {

        response = await fetch(`/admin/periodic-work/definitions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
        )

    } else {

        response = await fetch('/admin/periodic-work/definitions', {
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

    await loadDefinitions()

}



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

async function handleDeleteDefinition(id) {

    if (deleteId !== id) {

        deleteId = id

        renderDefinitions()


        setTimeout(() => {

            if (deleteId === id) {

                deleteId = null

                renderDefinitions()

            }

        }, 3000)

        return

    }


    const response = await fetch(`/admin/periodic-work/definitions/${id}`, {
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

    await loadDefinitions()

}

async function toggleDefinitionStatus(id, currentStatus) {

    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    const response = await fetch(`/admin/periodic-work/definitions/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: nextStatus
        })
    })

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadDefinitions()

}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function resetForm() {

    document.getElementById('definition-id').value = ''


    document.getElementById('definition-title').value = ''


    document.getElementById('definition-type-id').value = ''


    document.getElementById('definition-cycle-unit').value = 'month'


    document.getElementById('definition-cycle-value').value = 1


    document.getElementById('definition-first-due-date').value = ''


    document.getElementById('definition-active-from').value = ''


    document.getElementById('definition-active-to').value = ''


    document.getElementById('definition-status').value = 'ACTIVE'


    document.getElementById('definition-requires-result-file').checked = false

}

function formatInputDate(value) {

    if (!value) {
        return ''
    }


    return value.split('T')[0]

}


