const incidentState = {
    incidents: [],
    filteredIncidents: [],
    filters: {
        status: 'ALL',
        workType: 'ALL',
        overdueOnly: false,
        search: ''
    }
};

const API_URL = '/user/incident-work';

async function loadIncidents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Failed to load incidents');
        }

        const result = await response.json();

        console.log('Incident API Response:', result);

        const data = result?.data || {};

        const internal = Array.isArray(data.internal)
            ? data.internal
            : [];

        const external = Array.isArray(data.external)
            ? data.external
            : [];

        const recentClosed = Array.isArray(data.recent_closed)
            ? data.recent_closed
            : [];

        incidentState.incidents = [
            ...internal,
            ...external,
            ...recentClosed
        ];

        applyFilters();
        renderSummary();

    } catch (error) {
        console.error('loadIncidents error:', error);

        document.getElementById('iw-list-container').innerHTML = `
            <div class="iw-empty-state">
                Failed to load incidents
            </div>
        `;
    }
}
function applyFilters() {
    const filtered = incidentState.incidents.filter((incident) => {
        const statusMatch =
            incidentState.filters.status === 'ALL'
            || incident.status === incidentState.filters.status;

        const workTypeMatch =
            incidentState.filters.workType === 'ALL'
            || incident.work_type === incidentState.filters.workType;

        const overdueMatch =
            !incidentState.filters.overdueOnly
            || Boolean(incident.overdue);

        const searchText = incidentState.filters.search.toLowerCase();

        const searchMatch =
            !searchText
            || String(incident.title || '')
                .toLowerCase()
                .includes(searchText);

        return (
            statusMatch
            && workTypeMatch
            && overdueMatch
            && searchMatch
        );
    });

    incidentState.filteredIncidents = filtered;

    renderIncidentRows();
}

function renderSummary() {
    const incidents = incidentState.incidents;

    const open = incidents.filter(i => i.status === 'OPEN').length;
    const contracting = incidents.filter(i => i.status === 'CONTRACTING').length;
    const progress = incidents.filter(i => i.status === 'IN_PROGRESS').length;
    const reviewing = incidents.filter(i => i.status === 'REVIEWING').length;
    const closed = incidents.filter(i => i.status === 'CLOSED').length;
    const overdue = incidents.filter(i => i.overdue).length;

    document.getElementById('iw-summary-open').textContent = open;
    document.getElementById('iw-summary-contracting').textContent = contracting;
    document.getElementById('iw-summary-progress').textContent = progress;
    document.getElementById('iw-summary-reviewing').textContent = reviewing;
    document.getElementById('iw-summary-closed').textContent = closed;
    document.getElementById('iw-summary-overdue').textContent = overdue;
}

function renderIncidentRows() {
    const container = document.getElementById('iw-list-container');

    if (!incidentState.filteredIncidents.length) {
        container.innerHTML = `
            <div class="iw-empty-state">
                No incident work found
            </div>
        `;

        return;
    }

    container.innerHTML = incidentState.filteredIncidents
        .map((incident) => createIncidentRow(incident))
        .join('');

    bindDropdownEvents();
}

function createIncidentRow(incident) {
    const primaryAction = getPrimaryAction(incident);
    const progress = Number(incident.progress?.percent || 0);

    return `
        <div class="iw-row ${incident.overdue ? 'overdue' : ''}">

            <div>
                <div class="iw-title">
                    ${incident.title || '-'}
                </div>

                <div class="iw-meta">
                    <div class="iw-meta-tag">
                        #${incident.id}
                    </div>

                    <div class="iw-meta-tag">
                        ${incident.work_type || '-'}
                    </div>

                    <div class="iw-meta-tag">
                        ${incident.work_group || '-'}
                    </div>
                </div>
            </div>

            <div>
                <div class="iw-status-badge ${getStatusClass(incident.status)}">
                    ${incident.status || '-'}
                </div>

                <div class="iw-phase-label">
                    ${getPhaseLabel(incident.status)}
                </div>

                <div class="iw-progress-bar">
                    <div
                        class="iw-progress-fill"
                        style="width: ${progress}%"
                    ></div>
                </div>

                <div class="iw-progress-text">
                    ${progress}% completed
                </div>
            </div>

            <div class="iw-sla-block">
                <div class="iw-sla-item">
                    <div class="iw-sla-label">Due Date</div>
                    <div>
                        ${formatDate(incident.due_date)}
                    </div>
                </div>

                <div class="iw-sla-item">
                    <div class="iw-sla-label">Contractor</div>
                    <div>
                        ${incident.contractor_name || '-'}
                    </div>
                </div>

                ${incident.overdue ? `
                    <div class="iw-overdue">
                        Overdue
                    </div>
                ` : ''}
            </div>

            <div class="iw-actions">
                ${primaryAction ? `
                    <button
                        class="iw-primary-action"
                        onclick="handlePrimaryAction('${primaryAction.action}', ${incident.id})"
                    >
                        ${primaryAction.label}
                    </button>
                ` : ''}

                <div class="iw-dropdown">
                    <button class="iw-dropdown-toggle">
                        ⋮
                    </button>

                    <div class="iw-dropdown-menu">

    <button
        class="iw-dropdown-item"
        onclick="viewIncident(${incident.id})"
    >
        View Detail
    </button>

    ${hasPermission('incident.update') ? `
        <button
            class="iw-dropdown-item"
            onclick="editIncident(${incident.id})"
        >
            Edit
        </button>
    ` : ''}

    ${hasPermission('incident_work.manage') ? `
        <button
            class="iw-dropdown-item"
            onclick="disableIncident(${incident.id})"
        >
            Disable
        </button>
    ` : ''}

    ${hasPermission('incident_work.manage') ? `
        <button
            class="iw-dropdown-item iw-dropdown-danger"
            onclick="deleteIncident(${incident.id})"
        >
            Delete
        </button>
    ` : ''}

</div>
                </div>
            </div>

        </div>
    `;
}

function getStatusClass(status) {
    switch (status) {
        case 'OPEN':
            return 'iw-status-open';

        case 'CONTRACTING':
            return 'iw-status-contracting';

        case 'PLANNING':
            return 'iw-status-planning';

        case 'IN_PROGRESS':
            return 'iw-status-progress';

        case 'REVIEWING':
            return 'iw-status-reviewing';

        case 'CLOSED':
            return 'iw-status-closed';

        default:
            return 'iw-status-open';
    }
}

function getPhaseLabel(status) {
    switch (status) {
        case 'OPEN':
            return 'Awaiting Approval';

        case 'CONTRACTING':
            return 'Selecting Contractor';

        case 'PLANNING':
            return 'Preparing Checklist';

        case 'IN_PROGRESS':
            return 'Execution In Progress';

        case 'REVIEWING':
            return 'Awaiting Review';

        case 'CLOSED':
            return 'Completed';

        default:
            return '-';
    }
}

function getPrimaryAction(incident) {
    if (incident.status === 'OPEN' && incident.work_type === 'INTERNAL') {
        return {
            label: 'Approve',
            action: 'approve'
        };
    }

    if (incident.status === 'OPEN' && incident.work_type === 'EXTERNAL') {
        return {
            label: 'Contracting',
            action: 'contracting'
        };
    }

    if (incident.status === 'CONTRACTING') {
        return {
            label: 'Select Contractor',
            action: 'contractor'
        };
    }

    if (incident.status === 'PLANNING') {
        return {
            label: 'Setup Checklist',
            action: 'planning'
        };
    }

    if (incident.status === 'REVIEWING') {
        return {
            label: 'Close',
            action: 'close'
        };
    }

    return null;
}

function bindDropdownEvents() {
    document.querySelectorAll('.iw-dropdown-toggle').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();

            const dropdown = button.closest('.iw-dropdown');

            document
                .querySelectorAll('.iw-dropdown')
                .forEach((item) => {
                    if (item !== dropdown) {
                        item.classList.remove('open');
                    }
                });

            dropdown.classList.toggle('open');
        });
    });

    document.addEventListener('click', () => {
        document
            .querySelectorAll('.iw-dropdown')
            .forEach((item) => item.classList.remove('open'));
    });
}

function formatDate(date) {
    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString();
}

function viewIncident(id) {
    window.location.href = `/manager/incident-work/${id}`;
}

function editIncident(id) {
    window.location.href = `/manager/incident-work/${id}/edit`;
}

async function disableIncident(id) {
    const confirmed = await confirmModal({
        title: 'Disable Incident',
        message: 'This incident will be hidden from operational workflows.',
        confirmText: 'Disable',
        danger: true
    });

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/admin/incident-work/${id}/disable`,
            {
                method: 'PUT'
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to disable incident');
        }

        showSuccess(result.message || 'Incident disabled');

        await loadIncidents();

    } catch (error) {
        console.error(error);

        showError(error.message || 'Failed to disable incident');
    }
}

async function deleteIncident(id) {
    const confirmed = await confirmModal({
        title: 'Delete Incident',
        message: 'This action permanently deletes the incident and cannot be undone.',
        confirmText: 'Delete Permanently',
        danger: true
    });

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `/admin/incident-work/${id}`,
            {
                method: 'DELETE'
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to delete incident');
        }

        showSuccess(result.message || 'Incident deleted');

        await loadIncidents();

    } catch (error) {
        console.error(error);

        showError(error.message || 'Failed to delete incident');
    }
}

function handlePrimaryAction(action, id) {
    window.location.href = `/manager/incident-work/${id}`;
}

function bindFilters() {
    document.querySelectorAll('.iw-filter-chip').forEach((button) => {
        button.addEventListener('click', () => {
            document
                .querySelectorAll('.iw-filter-chip')
                .forEach((chip) => chip.classList.remove('active'));

            button.classList.add('active');

            incidentState.filters.status =
                button.dataset.filterStatus;

            applyFilters();
        });
    });

    document
        .getElementById('iw-work-type-filter')
        .addEventListener('change', (event) => {
            incidentState.filters.workType = event.target.value;
            applyFilters();
        });

    document
        .getElementById('iw-overdue-filter')
        .addEventListener('change', (event) => {
            incidentState.filters.overdueOnly = event.target.checked;
            applyFilters();
        });

    document
        .getElementById('iw-search-input')
        .addEventListener('input', (event) => {
            incidentState.filters.search = event.target.value;
            applyFilters();
        });

    document
        .querySelectorAll('.iw-summary-card')
        .forEach((card) => {
            card.addEventListener('click', () => {
                const status = card.dataset.summary;

                if (status === 'OVERDUE') {
                    incidentState.filters.overdueOnly = true;
                    document.getElementById('iw-overdue-filter').checked = true;
                } else {
                    incidentState.filters.status = status;

                    document
                        .querySelectorAll('.iw-filter-chip')
                        .forEach((chip) => {
                            chip.classList.remove('active');

                            if (chip.dataset.filterStatus === status) {
                                chip.classList.add('active');
                            }
                        });
                }

                applyFilters();
            });
        });

    document
        .getElementById('iw-refresh-btn')
        .addEventListener('click', loadIncidents);
}

document.addEventListener('DOMContentLoaded', () => {
    bindFilters();
    loadIncidents();
});