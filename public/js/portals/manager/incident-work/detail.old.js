const id = window.location.pathname.split('/').pop();

let incident = null;
let contractors = [];
let steps = [];

// ================== LOAD ==================

async function loadIncident() {
    await loadContractors();

    const res = await fetch(`/user/incident-work/${id}`);
    const json = await res.json();

    console.log('DETAIL:', json);

    incident = json.data;

    renderIncidentInfo();
    renderIncidentActions();
    renderIncidentChecklist();
    renderChecklistForm();
}

// ================== CONTRACTOR ==================

async function loadContractors() {
    const res = await fetch('/user/contractors');
    const json = await res.json();

    console.log('Contractors:', json);

    contractors = json.data || [];
}

// ================== RENDER ==================

function renderIncidentInfo() {
    document.getElementById('title').innerText = incident.incident.title;

    document.getElementById('info').innerHTML = `
    Status: ${incident.incident.status} <br/>
    Type: ${incident.incident.work_type} <br/>
    Overdue: ${incident.incident.overdue}
  `;
}

function renderIncidentActions() {
    const c = document.getElementById('actions');
    c.innerHTML = '';

    const s = incident.incident.status;

    if (s === 'OPEN' && incident.incident.work_type === 'INTERNAL') {
        c.innerHTML += `<button onclick="approveIncident()">Approve</button>`;
    }

    if (s === 'OPEN' && incident.incident.work_type === 'EXTERNAL') {
        c.innerHTML += `<button onclick="startContracting()">Start Contracting</button>`;
    }

    if (s === 'CONTRACTING') {
        if (!contractors.length) {
            c.innerHTML += `<div>No contractor</div>`;
            return;
        }

        const options = contractors.map(c =>
            `<option value="${c.id}">
        ${c.name} ${c.phone ? '(' + c.phone + ')' : ''}
      </option>`
        ).join('');

        c.innerHTML += `
      <select id="contractor_id">${options}</select>
      <button onclick="selectContractor()">Select Contractor</button>
    `;
    }

    if (s === 'PLANNING') {
        c.innerHTML += `<button onclick="createChecklist()">Create Checklist</button>`;
        c.innerHTML += `<button onclick="startIncident()">Start</button>`;
    }

    if (s === 'REVIEWING') {
        c.innerHTML += `<button onclick="closeIncident()">Close</button>`;
    }
}

function renderIncidentChecklist() {
    const c = document.getElementById('checklist');
    c.innerHTML = '';

    if (!incident.checklist) return;

    incident.checklist.forEach(item => {
        const el = document.createElement('div');

        el.innerHTML = `
      ${item.name}
      ${item.log_id ? '✅' : ''}

      <button onclick="completeChecklistItem(${item.id})">
        Done
      </button>
    `;

        c.appendChild(el);
    });
}

// ================== CHECKLIST FORM ==================

function renderChecklistForm() {
    if (incident.incident.status !== 'PLANNING') return;

    const container = document.getElementById('checklist-form');

    container.innerHTML = `
    <h4>Steps</h4>

    <div id="steps"></div>

    <input id="step-input" placeholder="Step name"/>
    <button onclick="addChecklistStep()">Add</button>

    <br/><br/>
    <button onclick="createChecklist()">Create Checklist</button>
  `;
}

function addChecklistStep() {
    const val = document.getElementById('step-input').value;

    if (!val) return;

    steps.push({ name: val });

    document.getElementById('step-input').value = '';

    renderChecklistSteps();
}

function renderChecklistSteps() {
    const c = document.getElementById('steps');

    c.innerHTML = steps.map((s, i) =>
        `<div>${i + 1}. ${s.name}</div>`
    ).join('');
}

// ================== API ACTION ==================

async function approveIncident() {
    await fetch(`/user/incident-work/${id}/approve`, { method: 'PUT' });
    loadIncident();
}

async function startContracting() {
    await fetch(`/user/incident-work/${id}/start-contracting`, { method: 'PUT' });
    loadIncident();
}

async function selectContractor() {
    const contractorId = document.getElementById('contractor_id').value;

    await fetch(`/user/incident-work/${id}/select-contractor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractor_id: contractorId })
    });

    loadIncident();
}

async function startIncident() {
    await fetch(`/user/incident-work/${id}/start`, { method: 'PUT' });
    loadIncident();
}

async function closeIncident() {
    await fetch(`/user/incident-work/${id}/close`, { method: 'PUT' });
    loadIncident();
}

async function createChecklist() {
    if (!steps.length) {
        alert('No steps');
        return;
    }

    await fetch(`/user/incident-work/${id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: steps })
    });

    steps = [];
    loadIncident();
}

async function completeChecklistItem(itemId) {
    const fileId = await uploadDummyFile();

    await fetch(`/user/incident-work/checklist/${itemId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            files: [fileId],
            note: 'done'
        })
    });

    loadIncident();
}

// ================== FILE ==================

async function uploadDummyFile() {
    const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: new FormData()
    });

    const json = await res.json();
    return json.data.id;
}

// ================== INIT ==================

loadIncident();