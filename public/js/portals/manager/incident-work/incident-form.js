const formState = {
    mode: window.INCIDENT_FORM_MODE,
    incident: null,
    loading: false
};

const formElements = {
    title: document.getElementById('iwf-title'),
    workType: document.getElementById('iwf-work-type'),
    workGroup: document.getElementById('iwf-work-group'),

    description: document.getElementById('iwf-description'),
    note: document.getElementById('iwf-note'),

    startDate: document.getElementById('iwf-start-date'),
    dueDate: document.getElementById('iwf-due-date'),

    submitBtn: document.getElementById('iwf-submit-btn'),

    workflowNotice: document.getElementById(
        'iwf-workflow-notice'
    ),

    pageTitle: document.getElementById(
        'iwf-page-title'
    ),

    statusBadge: document.getElementById(
        'iwf-status-badge'
    )
};

async function initForm() {
    bindEvents();

    if (formState.mode === 'edit') {
        await loadIncident();
    }
}

function bindEvents() {
    formElements.submitBtn.addEventListener(
        'click',
        submitForm
    );
}

async function loadIncident() {
    try {
        const response = await fetch(
            `/admin/incident-work/${window.INCIDENT_ID}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Failed to load incident'
            );
        }

        formState.incident = result.data.incident;

        bindIncidentData();

        applyFieldPermissions(
            formState.incident.status
        );

    } catch (error) {
        console.error(error);

        showError(
            error.message || 'Failed to load incident'
        );
    }
}

function bindIncidentData() {
    const incident = formState.incident;

    if (!incident) {
        return;
    }

    formElements.pageTitle.textContent =
        'Edit Incident';

    formElements.statusBadge.textContent =
        incident.status || '-';

    formElements.title.value =
        incident.title || '';

    formElements.workType.value =
        incident.work_type || 'INTERNAL';

    formElements.workGroup.value =
        incident.work_group || '';

    formElements.description.value =
        incident.description || '';

    formElements.note.value =
        incident.note || '';

    formElements.startDate.value =
        formatDateInput(incident.start_date);

    formElements.dueDate.value =
        formatDateInput(incident.due_date);
}

function applyFieldPermissions(status) {
    const allFields = [
        formElements.title,
        formElements.workType,
        formElements.workGroup,
        formElements.description,
        formElements.note,
        formElements.startDate,
        formElements.dueDate
    ];

    allFields.forEach((field) => {
        field.disabled = false;
    });

    switch (status) {

        case 'IN_PROGRESS':

            formElements.title.disabled = true;

            formElements.workType.disabled = true;

            formElements.workGroup.disabled = true;

            formElements.description.disabled = true;

            formElements.startDate.disabled = true;

            formElements.workflowNotice.innerHTML =
                'Only note and due date can be updated while work is in progress.';

            break;

        case 'REVIEWING':

            formElements.title.disabled = true;

            formElements.workType.disabled = true;

            formElements.workGroup.disabled = true;

            formElements.description.disabled = true;

            formElements.startDate.disabled = true;

            formElements.dueDate.disabled = true;

            formElements.workflowNotice.innerHTML =
                'Only internal note can be updated during reviewing state.';

            break;

        case 'CLOSED':

            allFields.forEach((field) => {
                field.disabled = true;
            });

            formElements.submitBtn.disabled = true;

            formElements.workflowNotice.innerHTML =
                'Closed incident is readonly.';

            break;

        default:

            formElements.workflowNotice.innerHTML =
                'Full editing available.';
    }

    if (
        formState.mode === 'edit' &&
        status !== 'OPEN'
    ) {
        formElements.workType.disabled = true;
    }
}

async function submitForm() {
    try {
        if (formState.loading) {
            return;
        }

        const payload = buildPayload();

        validatePayload(payload);

        formState.loading = true;

        setLoadingState(true);

        let url = '/admin/incident-work/createIncident';

        let method = 'POST';

        if (formState.mode === 'edit') {

            url =
                `/admin/incident-work/${window.INCIDENT_ID}/updateIncident`;

            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || 'Failed to save incident'
            );
        }

        showSuccess(
            result.message || 'Incident saved'
        );

        handleSuccessRedirect(result);

    } catch (error) {
        console.error(error);

        showError(
            error.message || 'Failed to save incident'
        );

    } finally {

        formState.loading = false;

        setLoadingState(false);
    }
}

function buildPayload() {
    return {
        title:
            formElements.title.value.trim(),

        work_type:
            formElements.workType.value,

        work_group:
            formElements.workGroup.value.trim(),

        description:
            formElements.description.value.trim(),

        note:
            formElements.note.value.trim(),

        start_date:
            formElements.startDate.value,

        due_date:
            formElements.dueDate.value
    };
}

function validatePayload(payload) {

    if (!payload.title) {
        throw new Error('Title is required');
    }

    // if (!payload.description) {
    //     throw new Error('Description is required');
    // }

    if (!payload.start_date) {
        throw new Error('Start date is required');
    }

    if (!payload.due_date) {
        throw new Error('Due date is required');
    }

    const startDate = new Date(payload.start_date);

    const dueDate = new Date(payload.due_date);

    if (dueDate < startDate) {
        throw new Error(
            'Due date must be greater than or equal to start date'
        );
    }
}

function setLoadingState(loading) {

    formElements.submitBtn.disabled = loading;

    formElements.submitBtn.innerHTML =
        loading
            ? 'Saving...'
            : 'Save Incident';
}

function handleSuccessRedirect(result) {

    if (formState.mode === 'create') {

        const incidentId =
            result.data?.id ||
            result.data?.incident?.id;

        if (!incidentId) {
            return;
        }

        window.location.href =
            `/manager/incident-work/${incidentId}`;

        return;
    }

    setTimeout(() => {

        window.location.href =
            `/manager/incident-work/${window.INCIDENT_ID}`;

    }, 600);
}

function formatDateInput(date) {

    if (!date) {
        return '';
    }

    return new Date(date)
        .toISOString()
        .split('T')[0];
}

document.addEventListener(
    'DOMContentLoaded',
    initForm
);