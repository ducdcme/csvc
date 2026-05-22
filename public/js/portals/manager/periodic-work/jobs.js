let types = []

let jobs = []



document.addEventListener('DOMContentLoaded', async () => {

    bindEvents()

    initMonthFilter()

    await loadTypes()

    await loadJobs()

})



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('filter-month').addEventListener('change', loadJobs)
    document.getElementById('filter-type-id').addEventListener('change', loadJobs)
    document.getElementById('filter-status').addEventListener('change', loadJobs)

}



/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

function initMonthFilter() {

    const now = new Date()

    const year = now.getFullYear()

    const month = String(now.getMonth() + 1)
        .padStart(2, '0')

    document.getElementById('filter-month')
        .value = `${year}-${month}`

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

    const select = document.getElementById('filter-type-id')

    select.innerHTML = `
        <option value="">
            All Types
        </option>
    `

    types.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| LOAD JOBS
|--------------------------------------------------------------------------
*/

async function loadJobs() {

    const month = document.getElementById('filter-month').value
    const typeId = document.getElementById('filter-type-id').value

    const status = document.getElementById('filter-status').value

    const url = new URL('/admin/periodic-work/jobs', window.location.origin)

    if (month) {
        url.searchParams.append(
            'month',
            month
        )
    }

    if (typeId) {
        url.searchParams.append(
            'type_id',
            typeId
        )
    }

    if (status) {
        url.searchParams.append(
            'status',
            status
        )
    }

    const response = await fetch(url)

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    jobs = result.data || []

    renderJobs()

}



/*
|--------------------------------------------------------------------------
| RENDER
|--------------------------------------------------------------------------
*/

function renderJobs() {

    const tbody = document.getElementById('job-table-body')

    tbody.innerHTML = ''

    if (!jobs.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No jobs found
                </td>
            </tr>
        `

        return

    }

    jobs.forEach((item, index) => {

        tbody.innerHTML += `
            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>

                    <div
                        class="table-title"
                        onclick="location.href='/manager/periodic-work/jobs/${item.id}'"
                        style="cursor: pointer"
                    >
                        ${item.title}
                    </div>

                    <div class="table-subtitle">
                        #${item.id}
                    </div>

                </td>

                <td>
                    ${item.type_name}
                </td>

                <td>
                    ${formatDate(item.due_date)}
                </td>

                <td>
                    ${renderStatus(item.display_status)}
                </td>

                <td>
                    ${renderProgress(item)}
                </td>

                <td>

                    <div class="table-action-group">

                        ${renderActionButtons(item)}

                    </div>

                </td>

            </tr>
        `

    })

}



/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function renderStatus(status) {

    if (status === 'done') {

        return `
            <span class="badge badge-success">
                DONE
            </span>
        `

    }

    if (status === 'overdue') {

        return `
            <span class="badge badge-danger">
                OVERDUE
            </span>
        `

    }

    if (status === 'skipped') {

        return `
            <span class="badge badge-warning">
                SKIPPED
            </span>
        `

    }

    return `
        <span class="badge badge-secondary">
            PENDING
        </span>
    `

}



/*
|--------------------------------------------------------------------------
| PROGRESS
|--------------------------------------------------------------------------
*/

function renderProgress(item) {

    if (
        item.total_rooms === null
        || item.total_rooms === undefined
    ) {

        return '-'

    }

    return `
        ${item.done_rooms || 0}
        /
        ${item.total_rooms}
    `

}



/*
|--------------------------------------------------------------------------
| ACTIONS
|--------------------------------------------------------------------------
*/

function renderActionButtons(item) {

    if (item.display_status === 'done') {

        return `
            <button
                class="btn-table-view"
                onclick="viewJob(${item.id})"
            >
                View
            </button>
        `

    }

    if (item.display_status === 'skipped') {

        return `
            <button
                class="btn-table-edit"
                onclick="reopenJob(${item.id})"
            >
                Reopen
            </button>
        `

    }

    return `
        <button
            class="btn-table-edit"
            onclick="completeJob(${item.id})"
        >
            Complete
        </button>

        <button
            class="btn-table-delete"
            onclick="skipJob(${item.id})"
        >
            Skip
        </button>
    `

}



/*
|--------------------------------------------------------------------------
| ACTIONS API
|--------------------------------------------------------------------------
*/

async function completeJob(id) {

    const response = await fetch(`/admin/periodic-work/jobs/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'done'
        })
    }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadJobs()

}



async function skipJob(id) {

    const response = await fetch(`/admin/periodic-work/jobs/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'skipped'
        })
    }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadJobs()

}



async function reopenJob(id) {

    const response = await fetch(`/admin/periodic-work/jobs/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'pending'
        })
    }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    await loadJobs()

}



/*
|--------------------------------------------------------------------------
| VIEW
|--------------------------------------------------------------------------
*/

function viewJob(id) {

    window.location.href = `/manager/periodic-work/jobs/${id}`

}



