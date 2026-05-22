/**
 * Load monthly checklist
 */
async function loadMonthly() {
  const res = await fetch('/user/periodic-work/monthly');
  const data = await res.json();

  renderMonthlyHeader(data.data.summary);
  renderMonthlyGroups(data.data.groups);
}

// ================= HEADER =================
function renderMonthlyHeader(summary) {
  const el = document.getElementById('monthlyHeader');

  el.innerHTML = `
    <div class="monthly-header">
      <div class="title">📅 Tháng này</div>
      <div class="progress">
        ${summary.done} / ${summary.total} hoàn thành
      </div>
      <div class="overdue">
        🔴 ${summary.overdue} quá hạn
      </div>
    </div>
  `;
}

// ================= GROUP =================
function renderMonthlyGroups(groups) {
  const el = document.getElementById('monthlyList');

  let html = '';

  groups.forEach(g => {

    html += `
      <div class="monthly-group">
        <div class="group-title">
          ${g.type_name} (${g.total})
        </div>
    `;

    g.items.forEach(j => {
      html += renderMonthlyItem(j);
    });

    html += `</div>`;
  });

  el.innerHTML = html;
}

// ================= ITEM =================
function renderMonthlyItem(j) {

  let icon = '☐';
  let cls = '';

  if (j.status === 'done') {
    icon = '✔';
    cls = 'done';
  } else if (j.status === 'overdue') {
    icon = '⚠';
    cls = 'overdue';
  }

  return `
    <div class="monthly-item ${cls}"
         onclick="goDetail(${j.id}, '${j.type}')">

      <div class="item-left">
        <span class="icon">${icon}</span>
        <span class="title">${j.title}</span>
      </div>

      <div class="item-right">
        ${formatDate(j.due_date)}
      </div>

    </div>
  `;
}

// ================= INIT =================
loadMonthly();