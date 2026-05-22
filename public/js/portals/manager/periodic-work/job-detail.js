const JOB_ID =
    window.location.pathname
        .split('/')
        .pop()

let job = null

let inspectionTree = null

let contractors = []

document.addEventListener('DOMContentLoaded', async () => {
    bindEvents()
    await loadJob()

})
document.getElementById('btn-manage-rooms')?.addEventListener('click', () => {
    window.location.href = `/manager/periodic-work/jobs/${JOB_ID}/assign`

})

function bindEvents() {

    document.getElementById('btn-edit-business')?.addEventListener('click', openBusinessDrawer)

    document.getElementById('btn-close-business-drawer')?.addEventListener('click', closeBusinessDrawer)

    document.getElementById('btn-save-business')?.addEventListener('click', saveBusinessInfo)

    document.getElementById('business-work-type')?.addEventListener('change', handleWorkTypeChange)
}

/*
|--------------------------------------------------------------------------
| LOAD JOB
|--------------------------------------------------------------------------
*/

async function loadJob() {

    const response = await fetch(
        `/admin/periodic-work/jobs/${JOB_ID}/detail`
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    job = result.data

    renderJob()

    // ===== INSPECTION =====
    if (job.type_code === 'inspection') {

        document.getElementById('inspection-section')
            .style.display = 'block'

        await loadInspectionTree()
        await loadAssignedRooms()

    }

    // ===== OPERATION / MAINTENANCE =====
    else {

        document.getElementById('attachment-section')
            .style.display = 'block'

        renderAttachments()

    }

}



/*
|--------------------------------------------------------------------------
| LOAD TREE
|--------------------------------------------------------------------------
*/

async function loadInspectionTree() {

    const response = await fetch(
        `/user/periodic-work/jobs/${JOB_ID}/rooms-tree`
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    inspectionTree = result.data

    renderInspectionTree()

}

/*
|--------------------------------------------------------------------------
| LOAD CONTRACTOR
|--------------------------------------------------------------------------
*/

async function loadContractors() {

    const response = await fetch(
        '/admin/contractors'
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    contractors = result.data || []

    renderContractorOptions()

}
/*
|--------------------------------------------------------------------------
| RENDER JOB
|--------------------------------------------------------------------------
*/

function renderJob() {

    document.getElementById('job-title').innerText = job.title || '-'

    document.getElementById('job-type').innerText = job.type_name || '-'

    document.getElementById('job-status').innerHTML = renderStatus(job.status)

    document.getElementById('job-due-date').innerText = formatDate(job.due_date)

    document.getElementById('job-completed-at').innerText = formatDateTime(job.completed_at)

    document.getElementById('job-work-group').innerText = job.work_group || '-'

    document.getElementById('job-work-type').innerText = job.work_type || '-'

    document.getElementById('job-contractor').innerText = job.contractor_name || '-'

    // ===== NOTE =====
    if (job.note?.trim()) {

        document.getElementById('note-section').style.display = 'block'

        document.getElementById('job-note').innerText = job.note

    }

}



/*
|--------------------------------------------------------------------------
| ATTACHMENTS
|--------------------------------------------------------------------------
*/

function renderAttachments() {

    const container = document.getElementById('attachment-list')

    container.innerHTML = ''

    if (!job.attachments?.length) {

        container.innerHTML = `
            <div class="empty-data">
                Không có tài liệu đính kèm
            </div>
        `

        return

    }

    job.attachments.forEach(item => {

        // ===== IMAGE =====
        if (item.mime_type?.startsWith('image/')) {

            container.innerHTML += `
                <div
                    class="attachment-image-item"
                    onclick="openImageViewer(${item.file_id})"
                >

                    <img
                        src="/api/files/${item.file_id}"
                        class="attachment-thumbnail"
                    >

                    <div class="attachment-label">
                        ${item.type}
                    </div>

                </div>
            `

            return

        }

        // ===== FILE =====
        container.innerHTML += `
            <a
                href="/api/files/${item.file_id}"
                target="_blank"
                class="attachment-file-item"
            >

                <div class="attachment-file-name">
                    ${item.original_name}
                </div>

                <div class="attachment-file-type">
                    ${item.type}
                </div>

            </a>
        `

    })

}

function renderContractorOptions() {

    const select =
        document.getElementById(
            'business-contractor-id'
        )

    select.innerHTML = `
        <option value="">
            Select Contractor
        </option>
    `

    contractors.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `

    })

}

/*
|--------------------------------------------------------------------------
| INSPECTION TREE
|--------------------------------------------------------------------------
*/

function renderInspectionTree() {

    document.getElementById('inspection-summary')
        .innerHTML = `
            <div class="inspection-progress">
                ${inspectionTree.summary.done}
                /
                ${inspectionTree.summary.total}
                rooms completed
            </div>
        `

    const container =
        document.getElementById(
            'inspection-tree'
        )

    container.innerHTML = ''

    inspectionTree.buildings.forEach(building => {

        container.innerHTML += `
            <div class="tree-building">

                <div class="tree-building-header">
                    🏢 ${building.name}
                    (${building.progress.done}/${building.progress.total})
                </div>

                ${renderFloors(building.floors)}

            </div>
        `

    })

}



function renderFloors(floors) {

    return floors.map(floor => {

        return `
            <div class="tree-floor">

                <div class="tree-floor-header">
                    📁Tầng ${floor.name}
                    (${floor.progress.done}/${floor.progress.total})
                </div>

                <div class="room-grid">
                    ${renderRooms(floor.rooms)}
                </div>

            </div>
        `

    }).join('')

}



function renderRooms(rooms) {

    return rooms.map(room => {

        return `
            <div class="room 
                tree-room
                ${room.status === 'done'
                ? 'done'
                : ''}
            ">

                <span>
                    ${room.room_code}
                    -
                    ${room.room_name}
                </span>

                <span>
                    ${room.status === 'done'
                ? '✅'
                : '⏳'}
                </span>

            </div>
        `

    }).join('')

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



async function loadLocationTree() {

    const response = await fetch(
        '/user/master-data/location'
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    locationTree = result.data || []

    renderRoomSelectorTree()

}
async function loadAssignedRooms() {

    const response = await fetch(
        `/user/periodic-work/jobs/${JOB_ID}/rooms`
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    const rooms = result.data || []

    assignedRoomIds =
        rooms.map(item => item.room_id)

    // renderAssignedRooms(rooms)

}

async function openBusinessDrawer() {

    await loadContractors()

    document.getElementById('business-work-group').value = job.work_group || ''

    document.getElementById('business-work-type').value = job.work_type || ''

    document.getElementById('business-contractor-id').value = job.contractor_id || ''

    handleWorkTypeChange()

    document.getElementById('business-drawer').classList.add('open')

}

function closeBusinessDrawer() {
    document.getElementById('business-drawer').classList.remove('open')
}

function handleWorkTypeChange() {

    const workType = document.getElementById('business-work-type').value

    const contractorSelect = document.getElementById('business-contractor-id')

    contractorSelect.disabled = workType !== 'EXTERNAL'

}
async function saveBusinessInfo() {

    const payload = {

        work_group: document.getElementById('business-work-group').value,

        work_type: document.getElementById('business-work-type').value,

        contractor_id: document.getElementById('business-contractor-id').value || null

    }

    const response = await fetch(
        `/admin/periodic-work/jobs/${JOB_ID}/business`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type':
                    'application/json'
            },
            body: JSON.stringify(payload)
        }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    closeBusinessDrawer()

    await loadJob()

}
/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDate(value) {

    if (!value) {
        return '-'
    }

    return new Date(value)
        .toLocaleDateString('vi-VN')

}



function formatDateTime(value) {

    if (!value) {
        return '-'
    }

    return new Date(value)
        .toLocaleString('vi-VN')

}