const INCIDENT_ID = window.location.pathname.split('/').pop();

const incidentDetailState = {
    incident: null,
    checklist: [],
    contractors: [],
    checklistDraft: []
};
let workflowLoading = false;
let editingChecklistItemId = null;

let deletingChecklistItemId = null;

const DETAIL_API = `/user/incident-work/${INCIDENT_ID}`;
const CONTRACTOR_API = `/user/contractors`;

async function loadIncidentDetail() {
    try {
        const [incidentResponse, contractorResponse] = await Promise.all([
            fetch(DETAIL_API),
            fetch(CONTRACTOR_API)
        ]);

        if (!incidentResponse.ok) {
            throw new Error('Failed to load incident detail');
        }

        const incidentResult = await incidentResponse.json();

        const contractorResult = contractorResponse.ok
            ? await contractorResponse.json()
            : { data: [] };

        incidentDetailState.incident = incidentResult.data?.incident || null;
        incidentDetailState.checklist = incidentResult.data?.checklist || [];
        incidentDetailState.contractors = contractorResult.data || [];
        incidentDetailState.progress = incidentResult.data?.progress || null;
        renderIncidentDetail();
        renderChecklist();
        renderChecklistPlanner();
        renderWorkflowActions();
        renderContractors();

    } catch (error) {
        console.error(error);

        document.getElementById('incident-work-detail').innerHTML = `
            <div class="iwd-empty-state">
                Failed to load incident detail
            </div>
        `;
    }
}
function bindChecklistPlannerEvents() {
    const addBtn = document.getElementById(
        'iwd-add-step-btn'
    );

    const saveBtn = document.getElementById(
        'iwd-save-checklist-btn'
    );

    if (addBtn) {
        addBtn.addEventListener('click', addChecklistDraft);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveChecklist);
    }
}
function renderIncidentDetail() {
    //Reset
    document.getElementById('iwd-workflow-actions').innerHTML = '';
    document.getElementById('iwd-checklist-container').innerHTML = '';

    const incident = incidentDetailState.incident;

    if (!incident) {
        return;
    }

    document.getElementById('iwd-title').textContent = incident.title || '-';

    document.getElementById('iwd-description').textContent =
        incident.description || '-';

    document.getElementById('iwd-note').textContent =
        incident.note || '-';

    document.getElementById('iwd-work-type').textContent =
        incident.work_type || '-';

    document.getElementById('iwd-work-group').textContent =
        incident.work_group || 'No Group';

    document.getElementById('iwd-incident-id').textContent =
        `#${incident.id}`;

    document.getElementById('iwd-status-badge').innerHTML = `
        <div class="iwd-status-badge ${getStatusClass(incident.status)}">
            ${incident.status}
        </div>
    `;

    document.getElementById('iwd-start-date').textContent =
        formatDate(incident.start_date);

    document.getElementById('iwd-due-date').textContent =
        formatDate(incident.due_date);

    document.getElementById('iwd-created-at').textContent =
        formatDateTime(incident.created_at);

    document.getElementById('iwd-approved-by').textContent =
        incident.approved_by || '-';

    document.getElementById('iwd-overdue-status').innerHTML =
        incident.overdue
            ? '<span class="iwd-overdue">Overdue</span>'
            : 'On Schedule';

    document.getElementById('iwd-contractor-name').textContent =
        incident.contractor_name || 'No contractor assigned';
        const progressData = incidentDetailState.progress || {};
        const progress = Number(progressData.percent || 0);
  

    document.getElementById('iwd-progress-value').textContent =
        `${progress}%`;

    document.getElementById('iwd-progress-fill').style.width =
        `${progress}%`;

    document.getElementById('iwd-checklist-summary').textContent =
        `${progressData.done || 0} / ${progressData.total || 0} completed`;

}

function renderChecklist() {
    const container = document.getElementById('iwd-checklist-container');

    if (!incidentDetailState.checklist.length) {
        container.innerHTML = `
            <div class="iwd-empty-state">
                No checklist available
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="iwd-checklist-list">
            ${incidentDetailState.checklist
            .map((item) => createChecklistItem(item))
            .join('')}
        </div>
    `;
}
function renderChecklistPlanner() {
    const planner = document.getElementById(
        'iwd-checklist-planner'
    );

    const incident = incidentDetailState.incident;

    if (!incident) {
        return;
    }

    const hasChecklist =
        incidentDetailState.checklist.length > 0;

    const allowPlanning =
        incident.status === 'PLANNING';

    if (!allowPlanning || hasChecklist) {
        planner.style.display = 'none';
        return;
    }

    planner.style.display = 'block';

    const container = document.getElementById(
        'iwd-planner-steps'
    );

    if (!incidentDetailState.checklistDraft.length) {
        incidentDetailState.checklistDraft.push({
            title: ''
        });
    }

    container.innerHTML = `
        <div class="iwd-planner-step-list">
            ${incidentDetailState.checklistDraft
            .map((step, index) => `
                    <div class="iwd-planner-step">

                        <div class="iwd-planner-step-index">
                            ${index + 1}
                        </div>

                        <input
                            type="text"
                            class="iwd-planner-input"
                            placeholder="Checklist step title"
                            value="${step.title || ''}"
                            onchange="updateChecklistDraft(${index}, this.value)"
                        />

                        <button
                            type="button"
                            class="iwd-remove-step-btn"
                            onclick="removeChecklistDraft(${index})"
                        >
                            ×
                        </button>

                    </div>
                `).join('')}
        </div>
    `;
}
function renderChecklistAttachments(item) {

    const attachments = item.log?.attachment_ids || [];

    if (!attachments.length) {
        return '';
    }

    return `
        <div class="iwd-check-attachments">

            ${attachments.map(file_id => {

                    return `
                        <div onclick="openImageViewer(${file_id})"                    
                            class="iwd-check-image"
                        >
                            <img
                                src="/api/files/${file_id}"
                                alt=""
                            />
                        </div>
                    `;
                

             
            }).join('')}

        </div>
    `;
}
function updateChecklistDraft(index, value) {
    if (!incidentDetailState.checklistDraft[index]) {
        return;
    }

    incidentDetailState.checklistDraft[index].title = value;
}
function addChecklistDraft() {
    incidentDetailState.checklistDraft.push({
        title: ''
    });

    renderChecklistPlanner();
}
function removeChecklistDraft(index) {
    incidentDetailState.checklistDraft.splice(index, 1);

    if (!incidentDetailState.checklistDraft.length) {
        incidentDetailState.checklistDraft.push({
            title: ''
        });
    }

    renderChecklistPlanner();
}

function createChecklistItem(item) {

    const completed = Boolean(item.completed);

    const canManageChecklist = incidentDetailState.incident.status === 'PLANNING';


    const isEditing = editingChecklistItemId === item.id;

    const isDeleting = deletingChecklistItemId === item.id;

    return `
        <div class="iwd-checklist-item ${completed ? 'completed' : ''}">

            <div class="iwd-checklist-left">

                <div class="iwd-check-icon ${completed ? 'iwd-check-completed' : 'iwd-check-pending'}">
                    ${completed ? '✓' : '•'}
                </div>

                <div>

                    ${isEditing
            ? `
                                <input
                                    type="text"
                                    id="edit-checklist-input-${item.id}"
                                    class="iwd-check-edit-input"
                                    value="${escapeQuotes(item.name)}"
                                />
                            `
            : `
                                <div class="iwd-check-title">
                                    ${item.name}
                                </div>
                            `
        }

                    <div class="iwd-check-status">
                        ${completed
            ? `Completed at ${formatDateTime(item.log?.created_at)}`
            : 'Pending execution'
        }
                    </div>
                    ${renderChecklistAttachments(item)}
                </div>

            </div>

            <div class="iwd-check-actions">

                ${canManageChecklist && !completed
            ? `
                            ${isEditing
                ? `
                                        <button
                                            class="iwd-check-edit"
                                            onclick="saveChecklistItem(${item.id})"
                                        >
                                            Save
                                        </button>

                                        <button
                                            class="iwd-check-delete"
                                            onclick="cancelEditChecklistItem()"
                                        >
                                            Cancel
                                        </button>
                                    `
                : isDeleting
                    ? `
                                            <div class="iwd-inline-confirm">

                                                <span>
                                                    Delete?
                                                </span>

                                                <button
                                                    class="iwd-check-delete"
                                                    onclick="confirmDeleteChecklistItem(${item.id})"
                                                >
                                                    Yes
                                                </button>

                                                <button
                                                    class="iwd-check-edit"
                                                    onclick="cancelDeleteChecklistItem()"
                                                >
                                                    Cancel
                                                </button>

                                            </div>
                                        `
                    : `
                                            <button
                                                class="iwd-check-edit"
                                                onclick="startEditChecklistItem(${item.id})"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                class="iwd-check-delete"
                                                onclick="startDeleteChecklistItem(${item.id})"
                                            >
                                                Delete
                                            </button>
                                        `
            }
                        `
            : ''
        }
            
            </div>

        </div>
    `;
}

async function saveChecklist() {
    try {
        const incident = incidentDetailState.incident;

        const validSteps = incidentDetailState.checklistDraft
            .filter((step) => step.title.trim())
            .map((step) => ({
                name: step.title.trim()
            }));

        if (!validSteps.length) {
            showError('Please add at least one checklist item');
            return;
        }

        const response = await fetch(
            `/admin/incident-work/${incident.id}/checklist`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: validSteps
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to create checklist');
        }

        showSuccess(result.message || 'Checklist created');

        incidentDetailState.checklistDraft = [];

        await loadIncidentDetail();

    } catch (error) {
        console.error(error);

        showError(error.message || 'Failed to create checklist');
    }
}
function renderWorkflowActions() {
    const container = document.getElementById('iwd-workflow-actions');

    const incident = incidentDetailState.incident;

    if (!incident) {
        return;
    }

    const actions = getWorkflowActions(incident)
        .filter((action) => hasPermission(action.permission));

    if (!actions.length) {
        container.innerHTML = `
            <div class="iwd-empty-state">
                No available actions
            </div>
        `;

        return;
    }

    container.innerHTML = actions.map((action) => `
        <button
            class="iwd-workflow-btn"
            onclick="handleWorkflowAction('${action.key}')"
        >
            ${action.label}
        </button>
    `).join('');
}

function getWorkflowActions(incident) {
    const actions = [];

    if (incident.status === 'OPEN' && incident.work_type === 'INTERNAL') {
        actions.push({
            key: 'approve',
            label: 'Approve Work',
            permission: 'incident.approve'
        });
    }
    if (incident.status === 'OPEN' && incident.work_type === 'EXTERNAL') {
        actions.push({
            key: 'contracting',
            label: 'Start Contracting',
            permission: 'incident.execute'
        });
    }

    if (incident.status === 'CONTRACTING') {
        actions.push({
            key: 'select-contractor',
            label: 'Assign Contractor',
            permission: 'incident.execute'
        });
    }

    if (incident.status === 'PLANNING') {
        actions.push({
            key: 'start',
            label: 'Start Work',
            permission: 'incident.execute'
        });
    }

    if (incident.status === 'REVIEWING') {
        actions.push({
            key: 'close',
            label: 'Close Work',
            permission: 'incident.approve'
        });
    }

    return actions;
}

function renderContractors() {
    const select = document.getElementById('iwd-contractor-select');

    if (!select) {
        return;
    }

    const currentContractorId = incidentDetailState.incident?.contractor_id;

    select.innerHTML = `
        <option value="">
            Select Contractor
        </option>

        ${incidentDetailState.contractors.map((contractor) => `
            <option
                value="${contractor.id}"
                ${Number(currentContractorId) === Number(contractor.id)
            ? 'selected'
            : ''}
            >
                ${contractor.name}
            </option>
        `).join('')}
    `;
}

function getStatusClass(status) {
    switch (status) {
        case 'OPEN':
            return 'iwd-status-open';

        case 'CONTRACTING':
            return 'iwd-status-contracting';

        case 'PLANNING':
            return 'iwd-status-planning';

        case 'IN_PROGRESS':
            return 'iwd-status-progress';

        case 'REVIEWING':
            return 'iwd-status-reviewing';

        case 'CLOSED':
            return 'iwd-status-closed';

        default:
            return 'iwd-status-open';
    }
}



async function completeChecklistItem(id) {
    try {
        const response = await fetch(
            `/user/incident-work/checklist/${id}/complete`,
            {
                method: 'POST'
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to complete item');
        }

        showSuccess(result.message || 'Checklist item completed');

        await loadIncidentDetail();

    } catch (error) {
        console.error(error);

        showError(error.message || 'Failed to complete item');
    }
}

async function handleWorkflowAction(action) {
    if (workflowLoading) {
        return;
    }
    if (action === 'close') {
        const confirmed = await confirmModal({
            title: 'Close Incident',
            message: 'This will mark the incident as completed.',
            confirmText: 'Close Incident'
        });

        if (!confirmed) {
            return;
        }
    }
    try {
        workflowLoading = true;

        toggleWorkflowButtons(true);

        const incident = incidentDetailState.incident;
        let url = '';
        let method = 'PUT';
        let body = null;

        switch (action) {
            case 'approve':
                url = `/user/incident-work/${incident.id}/approve`;
                break;

            case 'contracting':
                url = `/user/incident-work/${incident.id}/start-contracting`;
                break;

            case 'select-contractor': {
                const contractorId = document.getElementById(
                    'iwd-contractor-select'
                ).value;

                if (!contractorId) {
                    showError('Please select contractor');
                    return;
                }

                url = `/user/incident-work/${incident.id}/select-contractor`;

                body = JSON.stringify({
                    contractor_id: contractorId
                });

                break;
            }

            case 'start':
                url = `/user/incident-work/${incident.id}/start`;
                break;

            case 'close':
                url = `/user/incident-work/${incident.id}/close`;
                break;

            default:
                return;
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Workflow action failed');
        }

        showSuccess(result.message || 'Updated successfully');

        await loadIncidentDetail();

    } catch (error) {
        console.error(error);

        showError(error.message || 'Workflow action failed');

    } finally {
        workflowLoading = false;
        toggleWorkflowButtons(false);
    }
}
function toggleWorkflowButtons(disabled) {
    document
        .querySelectorAll('.iwd-workflow-btn')
        .forEach((button) => {
            button.disabled = disabled;

            if (disabled) {
                button.dataset.originalText = button.innerHTML;
                button.innerHTML = 'Processing...';
            } else if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        });
}
async function saveChecklistItem(itemId) {

    try {

        const input = document.getElementById(
            `edit-checklist-input-${itemId}`
        );

        if (!input) {
            return;
        }

        const name = input.value.trim();

        if (!name) {

            showError(
                'Checklist name is required'
            );

            return;
        }

        const response = await fetch(
            `/user/incident-work/checklist/item/${itemId}`,
            {
                method: 'PUT',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    name
                })
            }
        );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message
            );
        }

        editingChecklistItemId = null;

        showSuccess(
            'Checklist updated'
        );

        await loadIncidentDetail();

    } catch (e) {

        console.error(e);

        showError(
            e.message ||
            'Failed to update checklist'
        );
    }
}

async function confirmDeleteChecklistItem(
    itemId
) {

    try {

        const response = await fetch(
            `/user/incident-work/checklist/item/${itemId}`,
            {
                method: 'DELETE'
            }
        );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message
            );
        }

        deletingChecklistItemId = null;

        showSuccess(
            'Checklist deleted'
        );

        await loadIncidentDetail();

    } catch (e) {

        console.error(e);

        showError(
            e.message ||
            'Failed to delete checklist'
        );
    }
}
//HELPER FUNCTIONSs
function startEditChecklistItem(itemId) {

    editingChecklistItemId = itemId;

    renderChecklist();
}

function cancelEditChecklistItem() {

    editingChecklistItemId = null;

    renderChecklist();
}

function startDeleteChecklistItem(itemId) {

    deletingChecklistItemId = itemId;

    renderChecklist();
}

function cancelDeleteChecklistItem() {

    deletingChecklistItemId = null;

    renderChecklist();
}
function formatDate(date) {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString();
}

function formatDateTime(date) {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleString();
}
function escapeQuotes(text) {

    if (!text) {
        return '';
    }

    return text
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}
document.addEventListener('DOMContentLoaded', () => {
    bindChecklistPlannerEvents();
    loadIncidentDetail();
});