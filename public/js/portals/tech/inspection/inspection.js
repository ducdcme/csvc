const InspectionPage = (function () {

  // ================= STATE =================
  let state = {
    inspectionId: null,
    items: [],
    data: {},         // item_id -> { files, status, issue_note }
    viewData: null,
    inspectionStatus: null,
    isSubmitting: false
  };

  // ================= INIT =================
  async function initDashboard() {

    renderTime();

    await Promise.all([
      renderRecent(),
      renderOverdue(),
      loadDashboardData()
    ]);

    renderDashboard();
  }
  async function initForm() {

    const params = new URLSearchParams(window.location.search);

    const inspection_id = params.get('inspection_id');

    // ===== EDIT / VIEW =====
    if (inspection_id) {

      state.inspectionId = inspection_id;

      await loadDetail();

      if (state.inspectionStatus === 'submitted') {
        buildViewData();
        renderView();
        viewPage('view');
      } else {
        viewPage('form');
      }

      return;
    }

    // ===== CREATE =====
    state.zoneId = params.get('zone_id');
    state.date = params.get('date');

    viewPage('form');

    await createOrLoadInspection();
    await loadDetail();
  }

  // ================= NAVIGATION =================
  function viewPage(name) {

    const views = ['form', 'view', 'success'];

    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        el.style.display = (v === name) ? 'block' : 'none';
      }
    });

    // 🔥 xử lý riêng cho success
    if (name === 'success') {

      const el = document.getElementById('view-success');

      if (el) {
        el.innerHTML = `
                <div class="success-box">
                    ✔ Đã gửi báo cáo thành công
                </div>
            `;
      }
    }
  }

  function goBack() {
    window.location.href = '/tech/dashboard';
  }
  function openForm(zone_id, date = null) {

    if (!date) date = new Date().toISOString().slice(0, 10);

    window.location.href =
      `/tech/inspection/form?zone_id=${zone_id}&date=${date}`;
  }
  function continueForm(inspection_id) {
    window.location.href =
      `/tech/inspection/form?inspection_id=${inspection_id}`;
  }
  function viewInspection(inspection_id) {
    window.location.href =
      `/tech/inspection/form?inspection_id=${inspection_id}`;
  }
  // ================= API =================
  async function createOrLoadInspection() {

    const res = await fetch('/user/inspection/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zone_id: state.zoneId,
        date: state.date
      })
    });

    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    state.inspectionId = json.data.id;
  }

  async function loadDetail() {

    const res = await fetch(`/user/inspection/detail/${state.inspectionId}`);
    const json = await res.json();

    const rows = json.data || [];

    renderHeader(rows);
    buildState(rows);
    renderForm();
    bindFormData();
  }
  async function loadDashboardData() {

    const zoneRes = await fetch('/user/inspection/zones');
    const zoneJson = await zoneRes.json();

    const inspRes = await fetch('/user/inspection/today');
    const inspJson = await inspRes.json();

    state.zones = zoneJson.data || [];
    state.todayInspections = inspJson.data || [];
  }

  // ================= BUILD =================
  function buildState(rows) {

    state.items = [];
    state.data = {};

    const map = {};

    rows.forEach(r => {

      if (!map[r.item_id]) {

        map[r.item_id] = {
          item_id: r.item_id,
          item_name: r.item_name,

          // 🔥 GROUP + SORT
          system_name: r.system_name,
          system_display_order: r.system_display_order,
          display_order: r.display_order,

          // 🔥 HEADER
          zone_name: r.zone_name,
          inspection_date: r.inspection_date,
          submitted_at: r.submitted_at,

          // 🔥 LABEL
          ok_label: r.ok_label,
          not_ok_label: r.not_ok_label,

          result_id: r.result_id
        };

        state.items.push(map[r.item_id]);

        state.data[r.item_id] = {
          files: [],
          status: r.is_ok ?? null,
          issue_note: r.issue_note || ''
        };
      }

      if (r.file_id) {
        state.data[r.item_id].files.push({
          id: r.file_id,
          url: `/api/files/${r.file_id}`
        });
      }

      state.inspectionStatus = r.inspection_status;
    });

    // 🔥 SORT
    state.items.sort((a, b) => {
      if (a.system_display_order !== b.system_display_order) {
        return a.system_display_order - b.system_display_order;
      }
      return a.display_order - b.display_order;
    });
  }
  // ================= RENDER DASHBOARD =================
  function renderDashboard() {

    renderTodayStatus();
    renderZones();
    renderRecent();
  }
  // ================= RENDER TODAY STATUS =================
  function renderTodayStatus() {

    const list = state.todayInspections;

    let text = '🔴 CHƯA BẮT ĐẦU';

    if (list.length) {
      const done = list.filter(i => i.status === 'submitted').length;

      if (done === list.length) {
        text = '🟢 HOÀN THÀNH';
      } else {
        text = '🟡 ĐANG THỰC HIỆN';
      }
    }

    document.getElementById('today-status').innerText =
      `${text}`;
  }
  // ================= RENDER ZONES =================
  function renderZones() {

    const el = document.getElementById('zone-list');

    const hour = new Date().getHours();

    let html = '';

    state.zones.forEach(zone => {

      const insp = state.todayInspections.find(i => i.zone_id === zone.id);

      let status = '🔒 ĐANG KHÓA';
      let statusText = '(Mở sau 16:00)';
      let btn = '';

      if (hour >= 16 || hour <= 7) {
        statusText = '(Báo cáo đã mở)';
        if (!insp) {
          status = '🔴 CHƯA BẮT ĐẦU';
          btn = `<button class="btn-report" onclick="InspectionPage.openForm(${zone.id})">BẮT ĐẦU BÁO CÁO</button>`;
        }
        else if (insp.status === 'submitted') {
          status = '🟢 ĐÃ GỬI';
          btn = `<button class="btn-report" onclick="InspectionPage.viewInspection(${insp.id})">XEM BÁO CÁO ĐÃ GỬI</button>`;
          statusText = `(Đã gửi vào lúc ${formatTime(insp.submitted_at)})`;
        }
        else {
          status = '🟡 ĐANG LÀM';
          btn = `<button class="btn-report" onclick="InspectionPage.continueForm(${insp.id})">TIẾP TỤC BÁO CÁO</button>`;
          statusText = `(Bắt đầu làm từ lúc ${formatTime(insp.created_at)})`;
        }

      }
      else {
        status = '🔒 ĐANG KHÓA';
        btn = `<button class="btn-report btn-disabled">CHUẨN BỊ BÁO CÁO</button>`;

      }

      html += `
      <div class="card">
       <div class="zone-info">
       <div>
         <div class="zone-name">📍 ${zone.name}</div>
        </div>
        <span class="tag-lock">${status}</span>
       </div>
       <div class="center-text">${statusText}</div>
        <div>${btn}</div>
      </div>
      
    `;
    });

    el.innerHTML = html;
  }
  // ================= RENDER RECENT COMPLETE=================
  async function renderRecent() {

    const res = await fetch('/user/inspection/completed');
    const json = await res.json();

    const list = Array.isArray(json.data) ? json.data : [];
    if (!list.length) {
      renderEmpty('recent-list', 'Chưa có báo cáo hoàn thành');
      return;
    }
    let html = '';

    list.forEach(i => {

      html += `
      <div class="recent-item">

        <div class="recent-left" onclick="InspectionPage.viewInspection(${i.id})">
         ${formatDate(i.inspection_date)} - Báo cáo NNRR ${i.zone_name}
        </div>

        <div class="recent-right">
          ${i.last_time ? formatTime(i.last_time) : '--'}
        </div>

      </div>
    `;
    });

    document.getElementById('recent-list').innerHTML = html;
  }
  // ================= RENDER OVERDUE =================
  async function renderOverdue() {

    const res = await fetch('/user/inspection/overdue');
    const json = await res.json();

    const list = Array.isArray(json.data) ? json.data : [];

    // 🔥 nếu không có → ẩn luôn block
    if (!list.length) {
      hideBlock('overdue-section');
      return;
    }

    let html = '';

    list.forEach(i => {
      html += `
      <div class="overdue-item" onclick="InspectionPage.continueForm(${i.id})">
        ${formatDate(i.inspection_date)} - ❌ Báo cáo NNRR ${i.zone_name}
      </div>
    `;
    });

    document.getElementById('overdue-list').innerHTML = html;
  }
  // ============ RENDER HEADER++++=+

  function renderHeader(data) {

    if (!data || !data.length) return;

    const row = data[0];

    // ===== ZONE =====
    document.getElementById('zone-label').innerText =
      row.zone_name || '--';

    // ===== DATE =====
    const date = formatDate(row.inspection_date);
    const createdAt = row.created_at
      ? formatTime(row.created_at)
      : '--';

    document.getElementById('inspection-time').innerText =
      `Ngày KT: ${date} - Tạo lúc ${createdAt}`;

    // ===== STATUS =====
    const statusEl = document.getElementById('inspection-status');

    if (row.inspection_status === 'submitted') {

      const isLate = checkLate(row.inspection_date, row.submitted_at);

      statusEl.innerHTML = isLate
        ? 'Trạng thái: 🔴 TRỄ'
        : 'Trạng thái: 🟢 ĐÚNG HẠN';
    } else {
      statusEl.innerHTML = 'Trạng thái: 🟡 CHƯA GỬI';
    }
  }
  function checkLate(inspectionDate, submittedAt) {

    if (!submittedAt) return false;

    const deadline = new Date(inspectionDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(8, 0, 0, 0);

    return new Date(submittedAt) > deadline;
  }
  // ================= RENDER FORM =================
  function renderForm() {
    if (!state.items || !state.items.length) {
      renderEmpty('view-form', 'Không có dữ liệu kiểm tra');
      return;
    }
    const systems = {};

    // ===== GROUP THEO SYSTEM =====
    state.items.forEach(item => {
      const system = item.system_name || 'Khác';

      if (!systems[system]) {
        systems[system] = [];
      }

      systems[system].push(item);
    });

    let html = '';

    Object.entries(systems).forEach(([systemName, items]) => {

      html += `
      <div class="system-group">

        <h3 class="system-title">${systemName}</h3>
    `;

      items.forEach(item => {

        html += `
        <div class="card-item">
<!-- TITLE -->
          <div class="item-title">${item.item_name}</div>
          <!-- FILE -->
          <!-- CAMERA BUTTON -->
  <label for="file-${item.item_id}" 
         class="btn-camera" 
         id="btn-label-${item.item_id}">
    
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>

    ${item.camera_label || 'Chụp ảnh để bắt đầu hoặc sửa'}
  </label>

  <input type="file"
    id="file-${item.item_id}"
    accept="image/*,application/pdf"
    style="display:none"
    onchange="InspectionPage.handleFile(${item.item_id}, this)"
  />

  <!-- PREVIEW -->
  <div class="preview-wrap" 
       id="prev-box-${item.item_id}"
       onclick="InspectionPage.openImagelive(${item.item_id})">
        <img id="img-${item.item_id}" class="photo-output"/>
        <span class="zoom-icon">🔍</span>
        </div>

          <!-- STATUS BUTTON -->
          <div class="status-group">
            <button id="ok-${item.item_id}"
              class="btn-ok"
              disabled
              onclick="InspectionPage.setStatus(${item.item_id}, true)">
              ✔ ${item.ok_label || 'OK'}
            </button>

            <button id="fail-${item.item_id}"
              class="btn-fail"
              disabled
              onclick="InspectionPage.setStatus(${item.item_id}, false)">
              ❗ ${item.not_ok_label || 'Lỗi'}
            </button>
          </div>

         
          

          <!-- ISSUE -->
          <div id="issue-box-${item.item_id}" class="issue-box" style="display:none;">
            <textarea id="issue-${item.item_id}" placeholder="Nhập ghi chú lỗi..." oninput="InspectionPage.handleNote(${item.item_id})"></textarea>
          </div>

          <!-- ACTION -->
          <div class="action">
            <button id="save-${item.item_id}" class="btn-save"
              disabled
              onclick="InspectionPage.saveItem(${item.item_id})">
              💾 Lưu mục này
            </button>
          </div>
          <div id="err-${item.item_id}" class="err-box"></div>

        </div>
      `;
      });

      html += `</div>`;
    });

    document.getElementById('form-container').innerHTML = html;
  }
  function bindFormData() {

    state.items.forEach(item => {

      const d = state.data[item.item_id];

      // ===== IMAGE =====
      const imgBox = document.getElementById(`img-${item.item_id}`);
      const box = document.getElementById(`prev-box-${item.item_id}`);

      if (d.files.length) {
        imgBox.src = d.files[0].url;
        box.style.display = 'block';

      }

      // ===== STATUS =====
      if (d.status === true) {
        setActive(item.item_id, 'ok');
      }

      if (d.status === false) {
        setActive(item.item_id, 'fail');

        document.getElementById(`issue-box-${item.item_id}`).style.display = 'block';
        document.getElementById(`issue-${item.item_id}`).value = d.issue_note || '';
      }

      // ===== DISABLE nếu đã lưu =====
      if (item.result_id) {
        disableItem(item.item_id);
      }
    });
  }
  // ================= RENDER TIME =================
  function renderTime() {

    const now = new Date();

    document.getElementById('today-text').innerText =
      now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

    setInterval(() => {
      document.getElementById('clock-text').innerText =
        ' Thời gian hệ thống: ' + new Date().toLocaleTimeString();
    }, 1000);
  }
  // ================= RENDER VIEW =================
  function renderView() {
    if (!state.viewData || !state.viewData.systems) {
      renderEmpty('view-view', 'Không có dữ liệu báo cáo');
      return;
    }
    const v = state.viewData;

    let html = `
  <div class="view-container">

    <!-- ===== HEADER ===== -->
    <div class="view-header">
      <div class="top-bar">
        <button onclick="InspectionPage.goBack()">←</button>
        <span>CHI TIẾT BÁO CÁO</span>
        <span style="display:none;">📄</span>
      </div>

      <div><b>ZONE:</b> ${v.header.zone_name || ''}</div>

      <div>
        <b>NGÀY:</b> ${formatDate(v.header.date)}
        - <b>THỜI GIAN GỬI:</b> ${v.header.submitted_at ? formatTime(v.header.submitted_at) : '--'}
      </div>

      <div>
        <b>TRẠNG THÁI:</b>
        ${v.isLate
        ? '<span class="badge-fail">🔴 TRỄ HẠN</span>'
        : '<span class="badge-ok">🟢 ĐÚNG HẠN</span>'
      }
      </div>
    </div>

    <!-- ===== SUMMARY ===== -->
<div class="view-summary">
  <h4>BẢNG TỔNG HỢP</h4>

  <table>
    <thead>
      <tr>
        <th>Hạng mục</th>
        <th>Trạng thái</th>
      </tr>
    </thead>

    <tbody>

      ${Object.entries(v.systems).map(([systemName, items]) => `

          <!-- SYSTEM HEADER -->
          <tr class="system-row">
            <td colspan="2" style="text-align: left;">${systemName}</td>
          </tr>

          ${items.map(d => `
              <tr>
                <td>${d.name}</td>
                <td class="status-col">
                  ${d.status
          ? `<span class="badge-ok">✔ ${d.ok_label}</span>`
          : `<span class="badge-fail">⚠️ ${d.not_ok_label}</span>`
        }
                </td>
              </tr>
            `).join('')
        }

        `).join('')
      }

    </tbody>
  </table>
</div>

    <!-- ===== DETAIL ===== -->
    <div class="view-detail">
      <h4>CHI TIẾT TỪNG HỆ THỐNG</h4>

      ${Object.entries(v.systems).map(([systemName, items]) => `

          <div class="system-group">

            <h4>${systemName}</h4>

            ${items.map(d => `
                <div class="detail-item card">

                  <div class="title">
                    ${d.name}
                    ${d.status === false
          ? `<span class="badge-fail"> (${d.not_ok_label || 'Lỗi'})</span>`
          : ''
        }
                  </div>

                  <div class="images">
                    ${d.files.map(f => `
                        <img 
                          src="${f.url}" 
                          class="thumb"
                          onclick="InspectionPage.openImage('${f.id}')"
                        />
                      `).join('')
        }
                  </div>

                  ${d.status === false && d.note
          ? `<div class="note"><b>Ghi chú:</b> ${escapeHTML(d.note)}</div>`
          : ''
        }

                </div>
              `).join('')
        }

          </div>

        `).join('')
      }

    </div>

  </div>
  `;

    document.getElementById('view-view').innerHTML = html;
  }
  function buildViewData() {

    const first = state.items[0];

    const header = {
      zone_name: first?.zone_name,
      date: first?.inspection_date,
      submitted_at: first?.submitted_at
    };

    const hour = header.submitted_at
      ? new Date(header.submitted_at).getHours()
      : 0;

    const isLate = hour >= 23;

    const systems = {};

    state.items.forEach(i => {

      const system = i.system_name || 'Khác';

      if (!systems[system]) {
        systems[system] = [];
      }

      systems[system].push({
        name: i.item_name,
        status: state.data[i.item_id]?.status,
        note: state.data[i.item_id]?.issue_note,
        files: state.data[i.item_id]?.files || [],
        ok_label: i.ok_label,
        not_ok_label: i.not_ok_label
      });
    });

    state.viewData = {
      header,
      systems,
      isLate
    };
  }
  // ================= HANDLER =================
  function handleFile(item_id, input) {

    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    state.data[item_id].files = [file];
    state.data[item_id].preview = url;
    // preview
    document.getElementById(`img-${item_id}`).src = url;
    showBlock(`prev-box-${item_id}`);

    // update label
    const label = document.getElementById(`btn-label-${item_id}`);
    label.classList.add('has-file');
    label.innerHTML = '✅ Đã chụp ảnh';

    // enable status
    enableItem(item_id);
    highlightItem(item_id);
  }

  function setStatus(item_id, status) {

    const d = state.data[item_id];
    d.status = status;
    const okBtn = document.getElementById(`ok-${item_id}`);
    const failBtn = document.getElementById(`fail-${item_id}`);
    const issueBox = document.getElementById(`issue-box-${item_id}`);

    okBtn.classList.remove('active-ok');
    failBtn.classList.remove('active-fail');

    if (status) {
      okBtn.classList.add('active-ok');
      issueBox.style.display = 'none';
    } else {
      failBtn.classList.add('active-fail');
      issueBox.style.display = 'block';
      const input = document.getElementById(`issue-${item_id}`);
      if (input) {
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(
            input.value.length,
            input.value.length
          );
        }, 0);
      }
    }
    highlightItem(item_id);
  }
  async function saveItem(item_id) {

    const d = state.data[item_id];
    const errBox = document.getElementById(`err-${item_id}`);

    errBox.innerText = '';
    errBox.style.color = 'red';

    // ===== VALIDATE =====
    if (!d || !d.files || d.files.length === 0) {
      errBox.innerText = 'Chưa chọn ảnh';
      return;
    }

    if (d.status === null) {
      errBox.innerText = 'Chưa chọn trạng thái';
      return;
    }

    // ===== ISSUE NOTE =====
    if (d.status === false) {
      const note = document.getElementById(`issue-${item_id}`).value;

      if (!note) {
        errBox.innerText = 'Phải nhập mô tả sự cố';
        return;
      }

      d.issue_note = note;
    }

    try {

      // ===== 1. SAVE RESULT =====
      const res1 = await fetch('/user/inspection/save-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection_id: state.inspectionId,
          item_id: item_id,
          is_ok: d.status,
          issue_note: d.issue_note || null
        })
      });

      const json1 = await res1.json();

      if (!json1.success) {
        errBox.innerText = json1.message;
        return;
      }

      const resultId = json1.data.result_id;

      // ===== 2. UPLOAD FILE =====
      const fileIds = [];

      for (const file of d.files) {
        // 🔥 resize trước khi upload
        const resized = await resizeImage(file);
        const form = new FormData();
        form.append('file', resized);
        form.append('result_id', resultId);
        form.append('attachment_type', 'supporting_image');

        const uploadRes = await fetch('/user/inspection/attachment?module_name=inspection', {
          method: 'POST',
          body: form
        });

        const uploadJson = await uploadRes.json();

        if (!uploadJson.success) {
          errBox.innerText = 'Upload lỗi';
          return;
        }

        fileIds.push(uploadJson.data.file_id); // 🔥 đúng key
      }

      // ===== 3. ATTACH FILE =====
      await fetch('/user/inspection/save-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection_id: state.inspectionId,
          item_id: item_id,
          is_ok: d.status,
          issue_note: d.issue_note || null,
          file_ids: fileIds
        })
      });

      // ===== SUCCESS =====
      errBox.style.color = 'green';
      errBox.innerText = '✔ Đã lưu';

      // 🔥 update state
      const item = state.items.find(i => i.item_id === item_id);
      if (item) item.result_id = resultId;

      disableItem(item_id);

    } catch (err) {
      console.error(err);
      errBox.innerText = err.message;
    }
  }

  async function submit() {

    const errBox = document.getElementById('submit-error');
    errBox.innerText = '';

    // ===== VALIDATE =====
    const invalid = [];

    state.items.forEach(i => {

      const d = state.data[i.item_id];

      const isValid = (
        d &&
        d.status !== null &&
        d.files.length &&
        !(d.status === false && !d.issue_note)
      );

      // 🔥 highlight từng item
      highlightItem(i.item_id);

      if (!isValid) {
        invalid.push(i.item_id);
      }
    });
    if (invalid.length) {

      errBox.innerText = '⚠️ Chưa hoàn thành tất cả hạng mục';

      // 🔥 scroll tới item lỗi đầu tiên
      const first = invalid[0];

      const el = document.getElementById(`img-${first}`)?.closest('.card-item');

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      return;
    }

    if (state.isSubmitting) return;
    state.isSubmitting = true;

    const res = await fetch('/user/inspection/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inspection_id: state.inspectionId
      })
    });

    const json = await res.json();

    if (!json.success) {
      errBox.innerText = json.message;
      state.isSubmitting = false;
      return;
    }

    viewPage('success');

    setTimeout(() => {
      window.location.href = '/tech/dashboard';
    }, 1500);
  }
  // ================= VALIDATE ITEM =================
  function isItemValid(item_id) {

    const d = state.data[item_id];

    if (!d) return false;

    if (!d.files || d.files.length === 0) return false;

    if (d.status === null) return false;

    if (d.status === false && !d.issue_note) return false;

    return true;
  }
  // ================= VIEW MODE =================
  async function view(id) {

    state.inspectionId = id;

    await loadDetail();

    buildViewData();
    renderView();

    viewPage('view');
  }

  // ================= HELPERS =================
  function renderEmpty(elId, message = 'Không có dữ liệu') {
    const el = document.getElementById(elId);
    if (el) {
      el.innerHTML = `<div class="empty">${message}</div>`;
    }
  }

  function hideBlock(elId) {
    const el = document.getElementById(elId);
    if (el) el.style.display = 'none';
  }

  function showBlock(elId) {
    const el = document.getElementById(elId);
    if (el) el.style.display = 'block';
  }
  function setActive(item_id, type) {
    document.getElementById(`ok-${item_id}`).style.background =
      type === 'ok' ? 'green' : '';

    document.getElementById(`fail-${item_id}`).style.background =
      type === 'fail' ? 'red' : '';
  }


  function disableItem(item_id) {
    document.getElementById(`ok-${item_id}`).disabled = true;
    document.getElementById(`fail-${item_id}`).disabled = true;

    const saveBtn = document.querySelector(`[onclick="InspectionPage.saveItem(${item_id})"]`);
    if (saveBtn) saveBtn.disabled = true;
  }
  function enableItem(item_id) {

    document.getElementById(`ok-${item_id}`).disabled = false;
    document.getElementById(`fail-${item_id}`).disabled = false;

    const btn = document.getElementById(`save-${item_id}`);
    if (btn) btn.disabled = false;
  }
  function openImage(id) {
    const modal = document.getElementById('img-modal');
    const img = document.getElementById('img-modal-src');

    img.src = `/api/files/${id}`;
    modal.style.display = 'flex';

    img.onclick = (e) => e.stopPropagation();
  }
  function openItemImage(itemId) {
    // 1. Lấy data của item dựa trên ID
    const itemData = state.data[itemId];

    // 2. Kiểm tra xem có file nào không
    if (itemData && itemData.files && itemData.files.length > 0) {

      // Giả sử bạn muốn lấy tấm ảnh đầu tiên (hoặc ảnh mới nhất)
      const targetFile = itemData.files[0];

      console.log("Đang mở ảnh cho item:", itemId, "URL:", targetFile.url);
      const modal = document.getElementById('img-modal');
      const img = document.getElementById('img-modal-src');

      img.src = targetFile.url;
      modal.style.display = 'flex';

      img.onclick = (e) => e.stopPropagation();

    } else {
      alert("Không tìm thấy dữ liệu hình ảnh!");
    }
  }
  function openImagelive(itemId) {
    const src = document.getElementById('img-' + itemId).src;
    const modal = document.getElementById('img-modal');
    const img = document.getElementById('img-modal-src');

    img.src = src;
    modal.style.display = 'flex';

    img.onclick = (e) => e.stopPropagation();
  }
  function closeImage() {
    document.getElementById('img-modal').style.display = 'none';
  }


  function highlightItem(item_id) {

    const el = document
      .getElementById(`img-${item_id}`)
      ?.closest('.card-item');

    if (!el) return;

    if (!isItemValid(item_id)) {
      el.classList.add('invalid');
    } else {
      el.classList.remove('invalid');
    }
  }
  function handleNote(item_id) {

    const val = document.getElementById(`issue-${item_id}`).value;

    state.data[item_id].issue_note = val;

    highlightItem(item_id);
  }
  /**
 * Resize ảnh (không nén mạnh, chỉ giảm kích thước)
 * @param {File} file
 * @param {number} maxWidth
 */
  async function resizeImage(file, maxWidth = 1280) {

    return new Promise((resolve) => {

      // không phải ảnh → bỏ qua
      if (!file.type.startsWith('image/')) {
        return resolve(file);
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {

        let { width, height } = img;

        // 🔥 resize nếu vượt maxWidth
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 🔥 convert lại file (quality nhẹ thôi)
        canvas.toBlob((blob) => {

          const resized = new File(
            [blob],
            file.name,
            { type: 'image/jpeg' }
          );

          resolve(resized);

        }, 'image/jpeg', 0.85); // giữ chất lượng cao
      };

      reader.readAsDataURL(file);
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  return {
    initForm,
    initDashboard,
    handleFile,
    setStatus,
    saveItem,
    submit,
    view,
    openForm,
    continueForm,
    viewInspection,
    handleNote,
    openImage,
    openItemImage,
    openImagelive,
    closeImage,
    goBack
  };

})();