let definitions = []



document.addEventListener('DOMContentLoaded', async () => {

    bindEvents()

    initDefaultDate()

    await loadDefinitions()

})



/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

function bindEvents() {

    document.getElementById('btn-generate')
        .addEventListener('click', generateJob)

}



/*
|--------------------------------------------------------------------------
| INIT
|--------------------------------------------------------------------------
*/

function initDefaultDate() {

    const now = new Date()

    const yyyy = now.getFullYear()

    const mm = String(now.getMonth() + 1)
        .padStart(2, '0')

    const dd = String(now.getDate())
        .padStart(2, '0')

    document.getElementById('due-date')
        .value = `${yyyy}-${mm}-${dd}`

}



/*
|--------------------------------------------------------------------------
| LOAD DEFINITIONS
|--------------------------------------------------------------------------
*/

async function loadDefinitions() {

    const response = await fetch(
        '/admin/periodic-work/definitions'
    )

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
| RENDER DEFINITIONS
|--------------------------------------------------------------------------
*/

function renderDefinitions() {

    const select =
        document.getElementById(
            'definition-id'
        )

    select.innerHTML = `
        <option value="">
            Select Definition
        </option>
    `

    definitions.forEach(item => {

        select.innerHTML += `
            <option value="${item.id}">
                ${item.title}
                (${item.type_name})
            </option>
        `

    })

}



/*
|--------------------------------------------------------------------------
| GENERATE
|--------------------------------------------------------------------------
*/

async function generateJob() {

    const definitionId =
        document.getElementById(
            'definition-id'
        ).value

    const dueDate =
        document.getElementById(
            'due-date'
        ).value

    if (!definitionId) {

        showError('Please select definition')

        return

    }

    if (!dueDate) {

        showError('Please select due date')

        return

    }

    const response = await fetch(
        '/admin/periodic-work/generate',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                definition_id: definitionId,
                due_date: dueDate
            })
        }
    )

    const result = await response.json()

    if (!result.success) {

        showError(result.message)

        return

    }

    showSuccess(result.message)

    renderGenerateResult(result.data)

}



/*
|--------------------------------------------------------------------------
| RESULT
|--------------------------------------------------------------------------
*/

function renderGenerateResult(job) {

    document.getElementById('generate-result-section')
        .style.display = 'block'

    document.getElementById('generate-result')
        .innerHTML = `
            <div class="generate-result-grid">

                <div class="detail-item">
                    <label>Job ID</label>
                    <div>#${job.id}</div>
                </div>

                <div class="detail-item">
                    <label>Status</label>
                    <div>${job.status}</div>
                </div>

                <div class="detail-item">
                    <label>Due Date</label>
                    <div>${formatDate(job.due_date)}</div>
                </div>

            </div>
        `

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