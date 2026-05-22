// ================= PREVIEW =================
async function preview() {
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files.length) {
        showError('Chọn file trước');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/admin/import/room-names/preview', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        renderPreview(data.data);

    } catch (err) {
        showError('Preview lỗi');
    }
}

// ================= IMPORT =================
async function doImport() {
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files.length) {
        showError('Chọn file trước');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/admin/import/room-names', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        renderResult(data.data);

    } catch (err) {
        showError('Import lỗi');
    }
}

// ================= DOWNLOAD =================
function downloadTemplate() {
    window.open('/admin/import/room-names/template');
}

// ================= PREVIEW UI =================
function renderPreview(data) {
    const el = document.getElementById('previewSection');

    let html = `
    <div class="alert alert-info">
      Campus: ${data.campus_name} <br>
      Academic Year: ${data.academic_year} <br>
      Total: ${data.total}
    </div>
  `;

    if (data.errors.length) {
        html += `<div class="alert alert-danger">Có lỗi trong file</div>`;
    }

    html += `
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Building</th>
          <th>Room Code</th>
          <th>Room Name</th>
        </tr>
      </thead>
      <tbody>
  `;

    data.rows.forEach(r => {
        html += `
      <tr>
        <td>${r.building_name}</td>
        <td>${r.room_code}</td>
        <td>${r.room_name || ''}</td>
      </tr>
    `;
    });

    html += `</tbody></table>`;

    el.innerHTML = html;
}

// ================= RESULT =================
function renderResult(res) {
    const el = document.getElementById('previewSection');

    el.innerHTML = `
    <div class="alert alert-success">
      Tổng: ${res.total} <br>
      Inserted: ${res.inserted} <br>
      Updated: ${res.updated}
    </div>
  `;
}

// ================= ERROR =================
function showError(msg) {
    document.getElementById('previewSection').innerHTML = `
    <div class="alert alert-danger">${msg}</div>
  `;
}