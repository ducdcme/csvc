const id = window.location.pathname.split('/').pop();
let incident = null;

// ================== LOAD ==================

async function loadIncident() {
    const res = await fetch(`/user/incident-work/${id}`);
    const json = await res.json();

    console.log('TECH DETAIL:', json);

    incident = json.data;

    renderIncidentHeader();
    renderIncidentProgress();
    renderIncidentChecklist();
}

// ================== RENDER ==================

function renderIncidentHeader() {
    document.getElementById('title').innerText = incident.title;

    let statusText = `Status: ${incident.status}`;

    if (incident.status === 'CONTRACTING') {
        statusText += ' (Đang chọn nhà thầu)';
    }

    if (incident.status === 'PLANNING') {
        statusText += ' (Đang thiết lập)';
    }

    document.getElementById('status').innerText = statusText;

    if (incident.overdue) {
        document.getElementById('overdue').innerText = '⚠️ Quá hạn';
    }
}

function renderIncidentProgress() {
    const p = incident.progress;

    document.getElementById('progress').innerText =
        `Progress: ${p.done}/${p.total} (${p.percent}%)`;
}

function renderIncidentChecklist() {
    const c = document.getElementById('checklist');
    c.innerHTML = '';

    if (incident.status !== 'IN_PROGRESS') {
        c.innerHTML = `<div>⚠️ Chưa thể thực hiện</div>`;
        return;
    }

    incident.checklist.forEach(item => {
        const el = document.createElement('div');

        el.innerHTML = `
      ${item.name}
      ${item.log_id ? '✅' : ''}

      <input type="file" id="f-${item.id}" />
      <button onclick="completeChecklistItem(${item.id})">Done</button>
    `;

        c.appendChild(el);
    });
}

// ================== ACTION ==================

async function completeChecklistItem(itemId) {
    if (incident.status !== 'IN_PROGRESS') {
        alert('Sai trạng thái');
        return;
    }

    const input = document.getElementById(`f-${itemId}`);

    if (!input.files.length) {
        alert('Chọn file');
        return;
    }

    const file = input.files[0];

    const fd = new FormData();
    fd.append('file', file);

    const uploadRes = await fetch('/api/files/upload?module_name=incident_work', {
        method: 'POST',
        body: fd
    });

    const uploadJson = await uploadRes.json();
    const fileId = uploadJson.data.id;

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

// ================== INIT ==================

loadIncident();