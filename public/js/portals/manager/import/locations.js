let lastPreviewData = null;

/**
 * Preview import
 */
async function previewImport() {
  const file = document.getElementById('fileInput').files[0];

  if (!file) {
    alert('Chọn file trước');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/admin/import/locations/preview', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  lastPreviewData = data.data;

  renderPreview(data.data);
}

/**
 * Render preview table
 */
function renderPreview(data) {
  const el = document.getElementById('result');

  let html = `
    <p style="margin-bottom:10px">
      ✔ Valid: ${data.valid}/${data.total}
    </p>
  `;

  html += `
    <table border="1" cellpadding="6" style="border-collapse: collapse; width:100%">
      <tr style="background:#f0f0f0">
        <th>Row</th>
        <th>Campus</th>
        <th>Building</th>
        <th>Floor</th>
        <th>Room</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
  `;

  html += data.rows.map(r => {
    const hasError = r.errors.length > 0;

    return `
      <tr style="background:${hasError ? '#ffe6e6' : '#e6ffe6'}">
        <td>${r.row_number}</td>
        <td>${r.campus_code || ''}</td>
        <td>${r.building_code || ''}</td>
        <td>${r.floor_code || ''}</td>
        <td>${r.room_code || ''}</td>
        <td>${r.room_type_code || ''}</td>
        <td>
          ${hasError
        ? `<span style="color:red">${r.errors.join(', ')}</span>`
        : `<span style="color:green">OK</span>`
      }
        </td>
      </tr>
    `;
  }).join('');

  html += `</table>`;

  // 🔥 Import button control tại đây
  const disabled = data.errors.length > 0;

  html += `
    <div style="margin-top:15px">
      <button 
        onclick="submitImport()" 
        ${disabled ? 'disabled' : ''}
        style="
          padding:8px 16px;
          ${disabled ? 'opacity:0.5; cursor:not-allowed;' : ''}
        "
      >
        🚀 Import
      </button>
    </div>
  `;

  if (disabled) {
    html += `
      <p style="color:red; margin-top:10px">
        ❌ Fix lỗi trước khi import
      </p>
    `;
  }

  el.innerHTML = html;
}

/**
 * Submit import
 */
async function submitImport() {
  if (!lastPreviewData) {
    alert('Preview trước khi import');
    return;
  }

  if (lastPreviewData.errors.length > 0) {
    alert('Fix lỗi trước khi import');
    return;
  }

  const file = document.getElementById('fileInput').files[0];

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/admin/import/locations', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  alert(`Import xong:
Buildings: ${data.data.buildings}
Floors: ${data.data.floors}
Rooms: ${data.data.rooms}`);
}