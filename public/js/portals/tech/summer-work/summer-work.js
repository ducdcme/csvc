let dashboardData = {}



document.addEventListener('DOMContentLoaded', async () => {

    bindEvents()

    renderYearOptions()

    await loadDashboard()

})



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('filter-year').addEventListener('change',loadDashboard)

}



/*
|--------------------------------------------------------------------------
| YEAR
|--------------------------------------------------------------------------
*/

function renderYearOptions() {

    const select =
        document.getElementById(
            'filter-year'
        )

    const currentYear =
        new Date().getFullYear()

    for (
        let year = currentYear - 2;
        year <= currentYear + 1;
        year++
    ) {

        select.innerHTML += `
            <option value="${year}">
                ${year}
            </option>
        `

    }

    select.value = currentYear

}



/*
|--------------------------------------------------------------------------
| LOAD
|--------------------------------------------------------------------------
*/

async function loadDashboard() {

    const year =document.getElementById('filter-year').value

    const response = await fetch(`/user/dashboard/summer-work?year=${year}`)

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    dashboardData = result.data || {}

    renderBoard()

}



/*
|--------------------------------------------------------------------------
| RENDER BOARD
|--------------------------------------------------------------------------
*/

function renderBoard() {

    const container =
        document.getElementById(
            'summer-work-board'
        )

    container.innerHTML = ''

    // ===== INTERNAL =====
    container.innerHTML += `
        ${renderSection(
        'I. CÔNG VIỆC THỰC HIỆN BỞI PHÒNG VẬN HÀNH',
        dashboardData.internal
    )}
    `

    // ===== XD =====
    container.innerHTML += `
        ${renderSection(
        'II. CÔNG VIỆC THỰC HIỆN BỞI NHÀ THẦU - XÂY DỰNG',
        dashboardData.xd
    )}
    `

    // ===== ME =====
    container.innerHTML += `
        ${renderSection(
        'III. CÔNG VIỆC THỰC HIỆN BỞI NHÀ THẦU - CƠ ĐIỆN',
        dashboardData.me
    )}
    `

}



/*
|--------------------------------------------------------------------------
| SECTION
|--------------------------------------------------------------------------
*/


function renderSection(
    title,
    data
) {

    const periodic =
        data.periodic || []

    const incident =
        data.incident || []

    if (
        !periodic.length
        &&
        !incident.length
    ) {

        return ''

    }

    return `
        <div class="summer-section">

            <div class="summer-section-title">
                ${title}
            </div>

            ${renderDesktopTable([

                ...(periodic.length
                    ? [
                        {
                            is_sub_title: true,
                            title:
                                'Công việc định kỳ hằng năm'
                        },
            
                        ...periodic
                    ]
                    : []),
            
                ...(incident.length
                    ? [
                        {
                            is_sub_title: true,
                            title:
                                'Công việc phát sinh mới'
                        },
            
                        ...incident
                    ]
                    : [])
            
            ])}

            ${renderMobileSection(
                periodic,
                incident
            )}

        </div>
    `

}


/*
|--------------------------------------------------------------------------
| SUB SECTION
|--------------------------------------------------------------------------
*/

function renderSubSection(
    title,
    rows
) {

    // ===== HIDE EMPTY =====
    if (!rows || !rows.length) {
        return ''
    }

    return `
        <div class="summer-sub-section">

            <div class="summer-sub-title">
                ${title}
            </div>

            ${renderDesktopTable(rows)}

            ${renderMobileCards(rows)}

        </div>
    `

}



/*
|--------------------------------------------------------------------------
| DESKTOP TABLE
|--------------------------------------------------------------------------
*/


function renderDesktopTable(rows) {

    if (!rows.length) {
        return ''
    }

    let stt = 1

    return `
        <div class="summer-table desktop-only">

            <div class="summer-table-header">

                <div>STT</div>
                <div>Nội dung công việc</div>
                <div>Nhà thầu</div>
                <div>Trạng thái</div>
                <div>Bắt đầu</div>
                <div>Kết thúc</div>

            </div>

            ${
                rows.map(item => {

                    // ===== SUB TITLE =====
                    if (
                        item.is_sub_title
                    ) {

                        return `
                            <div class="
                                summer-sub-row
                            ">

                                ${item.title}

                            </div>
                        `

                    }

                    return renderDesktopRow(
                        item,
                        stt++
                    )

                }).join('')
            }

        </div>
    `

}


/*
|--------------------------------------------------------------------------
| DESKTOP ROW
|--------------------------------------------------------------------------
*/

function renderDesktopRow(
    item,
    index
) {

    return `
        <div class="summer-table-row" onclick="redirectJob(${item.id}, '${item.source}')">

            <div>
                ${index}
            </div>

            <div>
                ${item.title}
            </div>

            <div>
                ${item.contractor_name || '-'}
            </div>

            <div>
                ${renderStatus(item.status)}
            </div>

            <div>
                ${formatDate(item.start_date)}
            </div>

            <div>
                ${formatDate(item.due_date)}
            </div>

        </div>
    `

}


/*
|--------------------------------------------------------------------------
| MOBILE ITEM
|--------------------------------------------------------------------------
*/

function renderMobileCard(item) {

    return `
        <div class="summer-card" onclick="redirectJob(${item.id}, '${item.source}')">

            <div class="summer-card-title">
                ${item.title}
            </div>

            <div class="summer-card-info">
                <strong>Contractor:</strong>
                ${item.contractor_name || '-'}
            </div>

            <div class="summer-card-info">
                <strong>Status:</strong>
                ${renderStatus(item.status)}
            </div>

            <div class="summer-card-info">
                <strong>Due:</strong>
                ${formatDate(item.due_date)}
            </div>

        </div>
    `

}

function renderMobileSection(
    periodic,
    incident
) {

    return `
        <div class="mobile-only">

            ${
                periodic.length
                ? `
                    <div class="
                        summer-mobile-subtitle
                    ">
                        Công việc định kỳ hằng năm
                    </div>

                    ${
                        periodic.map(
                            item =>
                                renderMobileCard(
                                    item
                                )
                        ).join('')
                    }
                `
                : ''
            }

            ${
                incident.length
                ? `
                    <div class="
                        summer-mobile-subtitle
                    ">
                        Công việc phát sinh mới
                    </div>

                    ${
                        incident.map(
                            item =>
                                renderMobileCard(
                                    item
                                )
                        ).join('')
                    }
                `
                : ''
            }

        </div>
    `

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

    if (status === 'in_progress') {

        return `
            <span class="badge badge-primary">
                IN PROGRESS
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
async function redirectJob(jobId, source) {

    if (source === 'INCIDENT') {
        return window.location.href = `/tech/incident-work/${jobId}`;
    }

    if (source === 'PERIODIC') {

        try {
            const response = await fetch(`/user/periodic-work/jobs/${jobId}`);
            const result = await response.json();

            if (!result.success || !result.data) {
                showError('Không tìm thấy công việc');
                return;
            }

            switch (result.data.type) {
                case 'inspection':
                    return window.location.href =
                        `/tech/periodic-work/${jobId}/rooms`;

                case 'operation':
                    return window.location.href =
                        `/tech/periodic-work/${jobId}/submit-operation`;

                case 'maintenance':
                    return window.location.href =
                        `/tech/periodic-work/${jobId}/submit-maintenance`;

                default:
                    showError('Loại công việc không hợp lệ');
            }

        } catch (err) {
            console.error(err);
            showError('Có lỗi xảy ra');
        }
    }
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(value) {

    if (!value) {
        return '-'
    }

    return new Date(value)
        .toLocaleDateString('vi-VN')

}