async function loadDashboard() {
  const res = await fetch('/user/periodic-work/dashboard');
  const data = await res.json();
  const container = document.getElementById('dashboard');

  if (isEmptyDashboard(data.data)) {
    container.innerHTML = `
      <div class="alert alert-info text-center">
        Không có công việc định kỳ
      </div>
    `;
    return;
  }
  renderSummary(data.data.summary);
  renderOverdue(data.data.overdue);
  renderPending(data.data.pending);
  renderDone(data.data.done);
}

// ================= SUMMARY =================
function renderSummary(summary) {
  const el = document.getElementById('summarySection');

  let overdue = 0;
  let pending = 0;

  Object.values(summary).forEach(s => {
    overdue += s.overdue || 0;
    pending += s.pending || 0;
  });

  const today = new Date().toLocaleDateString('vi-VN');

  el.innerHTML = `
    <div class="dashboard-header">
      <div class="header-title">Thông tin chung</div>
      <div class="header-sub">Hôm nay: ${today}</div> 
      <div class="header-stats">
        <span class="badge overdue">🔴 ${overdue} quá hạn</span>
        <span class="badge pending">🟡 ${pending} đang làm</span>
      </div>
    </div>
  `;
}

// ================= OVERDUE =================
function renderOverdue(list) {
  const el = document.getElementById('overdueSection');

  if (!list || list.length === 0) {
    el.innerHTML = '';
    return;
  }

  const grouped = groupByType(sortOverdue(list));

  let html = `<div class="section-title danger">⚠️ Cần xử lý ngay</div>`;

  Object.values(grouped).forEach(group => {

    group.items.forEach(j => {
      html += `
        <div class="task-card overdue">

          <div class="task-title">${j.title}</div>
          <div class="task-meta">${group.type_name}</div>

          <div class="task-status danger">
            Quá hạn ${j.overdue_days} ngày
          </div>

          ${renderProgress(j)}

          <button class="btn primary danger w-100"
                  onclick="goDetail(${j.id}, '${j.type}')">
            Xử lý ngay
          </button>

        </div>
      `;
    });

  });

  el.innerHTML = html;
}

// ================= PENDING =================
function renderPending(list) {
  const el = document.getElementById('pendingSection');

  if (!list || list.length === 0) {
    el.innerHTML = '';
    return;
  }

  const grouped = groupByType(list);

  let html = `<div class="section-title">🛠 Công việc tháng này</div>`;

  Object.values(grouped).forEach(group => {

    group.items.forEach(j => {

      const isStarted = j.progress && j.progress.done > 0;

      html += `
        <div class="task-card">

          <div class="task-title">${j.title}</div>
          <div class="task-meta">${group.type_name}</div>

          <div class="task-status">
            Thời hạn hoàn thành: ${formatDate(j.due_date)}
          </div>

          ${renderProgress(j)}

          <button class="btn primary w-100"
                  onclick="goDetail(${j.id}, '${j.type}')">
            ${isStarted ? 'Tiếp tục' : 'Bắt đầu'}
          </button>

        </div>
      `;
    });

  });

  el.innerHTML = html;
}

// ================= DONE =================
function renderDone(list) {
  const el = document.getElementById('doneSection');

  if (!list || list.length === 0) {
    el.innerHTML = '';
    return;
  }

  let html = `<div class="section-title muted">✔ Hoàn thành gần đây</div>`;

  list.slice(0, 5).forEach(j => {
    html += `
      <div class="done-item">
        ✓ ${j.title}
      </div>
    `;
  });

  el.innerHTML = html;
}
function renderProgress(j) {
  if (!j.progress) return `<div class="progress-wrapper">
      <div class="progress-bar">
        <div class="progress-fill" style="width:0%"></div>
      </div>
      <div class="progress-text">
        0/1
      </div>
    </div>
  `;

  const percent = Math.round((j.progress.done / j.progress.total) * 100);

  return `
    <div class="progress-wrapper">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
      <div class="progress-text">
        ${j.progress.done}/${j.progress.total}
      </div>
    </div>
  `;
}
// ================= CARD =================
function createCard(j, color) {
  const div = document.createElement('div');
  div.className = `card p-2 mb-2 border-${color}`;

  div.innerHTML = `
    <div>
      <b>[${j.type}]</b> ${j.title}<br>
      Due: ${j.due_date}
      ${j.overdue_days ? `<br><span class="text-danger">Quá hạn ${j.overdue_days} ngày</span>` : ''}
      ${j.progress ? `<br>Progress: ${j.progress.done}/${j.progress.total}` : ''}
    </div>
  `;

  div.style.cursor = 'pointer';
  div.onclick = () => {
    goDetail(j.id, `${j.type}`);
  };

  return div;
}
function isEmptyDashboard(data) {
  return (
    (!data.overdue || data.overdue.length === 0) &&
    (!data.pending || data.pending.length === 0) &&
    (!data.done || data.done.length === 0)
  );
}
function groupByType(list) {
  const map = {};

  list.forEach(j => {
    if (!map[j.type]) {
      map[j.type] = {
        type_name: j.type_name,
        items: []
      };
    }
    map[j.type].items.push(j);
  });

  return map;
}

function sortOverdue(list) {
  return list.sort((a, b) => b.overdue_days - a.overdue_days);
}

function goDetail(jobId, jobType) {

  let url = '';

  switch (jobType) {
    case 'inspection':
      url = `/tech/periodic-work/${jobId}/rooms`;
      break;

    case 'operation':
      url = `/tech/periodic-work/${jobId}/submit-operation`;
      break;

    case 'maintenance':
      url = `/tech/periodic-work/${jobId}/submit-maintenance`;
      break;

    default:
      console.error('Unknown job type:', jobType);
      return;
  }

  window.location.href = url;
}
loadDashboard();