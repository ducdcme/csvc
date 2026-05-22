let state = {
    jobId: null,
    buildings: [],
    selectedFloor: null,
    selectedRoom: null,
    assets: [],
    repaired: {},
    openAssetId: null
};

let selectedFiles = [];
/* ================= INIT ================= */
function getJobId() {
    const p = window.location.pathname.split('/');
    return p[p.length - 2];
}

async function init() {

    state.jobId = getJobId();
    bindFileInput();
    await loadTree();

    // ===== NAV BUTTON (ĐẶT Ở ĐÂY) =====
    document.getElementById('btnPrevFloor').onclick = () => {
        const floors = state.buildings[0].floors;
        const idx = floors.findIndex(f => f.id === state.selectedFloor.id);
        if (idx > 0) {
            selectFloor(floors[idx - 1]);
        }
    };

    document.getElementById('btnNextFloor').onclick = () => {
        const floors = state.buildings[0].floors;
        const idx = floors.findIndex(f => f.id === state.selectedFloor.id);
        if (idx < floors.length - 1) {
            selectFloor(floors[idx + 1]);
        }
    };
}

document.addEventListener('DOMContentLoaded', init);

/* ================= LOAD TREE ================= */
async function loadTree() {
    const [res, jobRes] = await Promise.all([
        api(`/user/periodic-work/jobs/${state.jobId}/rooms-tree`),
        api(`/user/periodic-work/jobs/${state.jobId}`)
    ]);
    // ===== TREE =====
    state.summary = res.data.summary;
    state.buildings = res.data.buildings;
    // ===== JOB =====
    state.job = jobRes.data;

    renderJobTitle();

    renderSummary(res.data.summary);
    // 🔥 lấy floor đầu tiên
    const floors = state.buildings[0]?.floors || [];

    if (floors.length) {
        selectFloor(floors[0]); // đã render grid + nav
    }

}

/* ================= SUMMARY ================= */
function renderSummary(sum) {
    document.getElementById('jobSummary').innerText =
        `Hoàn thành ${sum.done}/${sum.total}`;
}

/* ================= FLOOR ================= */

function selectFloor(floor) {

    state.selectedFloor = floor;
    updateLocation();
    // reset room
    state.selectedRoom = null;
    state.openAssetId = null;
    state.assets = [];
    state.repaired = {};

    document.getElementById('roomDetail').style.display = 'none';
    document.getElementById('assetList').innerHTML = '';

    renderRoomGrid();
    renderFloorNav();
}
/* ================= ROOM ================= */
function renderRoomGrid() {

    const el = document.getElementById('roomGrid');
    el.innerHTML = '';

    state.selectedFloor.rooms.forEach(r => {

        const div = document.createElement('div');
        div.className = 'room';

        // ===== COUNT LỖI =====
        let errorCount = 0;
        let statusClass = 'room-pending';
        // nếu đang ở room hiện tại → lấy từ state
        if (state.selectedRoom && state.selectedRoom.job_room_id === r.job_room_id) {
            errorCount = Object.keys(state.repaired).length;
            div.classList.add('room-active');
        }

        // ===== STATUS TEXT =====
        let statusText = '[ ]';

        if (r.status === 'done') {
            statusText = '[V]';
            statusClass = 'room-done';
        }

        if (errorCount > 0) {
            statusText = `[!${errorCount}]`;
            statusClass = 'room-error';
        }

        div.className = 'room ' + statusClass;
        div.innerText = `${r.room_code} - ${r.room_name} ${statusText}`;

        // disable nếu done
        if (r.status !== 'done') {
            div.onclick = () => selectRoom(r);
        } else {
            div.classList.add('disabled');
        }

        el.appendChild(div);
    });
    // ===== PROGRESS FLOOR =====
    const total = state.selectedFloor.rooms.length;

    let done = 0;

    state.selectedFloor.rooms.forEach(r => {
        if (r.status === 'done') done++;
    });

    document.getElementById('floorProgress').innerText =
        `ĐÃ CHECK: ${done}/${total} PHÒNG`;
}

async function selectRoom(room) {

    // 🔒 chặn nếu đã done
    if (room.status === 'done') {
        showError('Phòng đã hoàn thành');
        return;
    }

    if (!state.selectedRoom || state.selectedRoom.job_room_id !== room.job_room_id) {

        state.openAssetId = null;
        state.assets = [];
        state.repaired = {};

        document.getElementById('assetList').innerHTML = '';
    }
    document.getElementById('confirmWrap').style.display = 'none';

    // ===== SET ROOM =====
    state.selectedRoom = room;
    updateLocation();

    document.getElementById('roomDetail').style.display = 'block';
    document.getElementById('roomTitle').innerText = room.room_code;

    // ===== LOAD ASSET =====
    await loadAssets(room.room_id);
}

/* ================= ASSET ================= */
async function loadAssets(roomId) {
    const res = await api(`/api/rooms/${roomId}/assets`);
    state.assets = res.data;

    renderAssets();
}

function renderAssets() {

    const el = document.getElementById('assetList');
    el.innerHTML = '';

    state.assets.forEach((a, index) => {

        const div = document.createElement('div');
        div.className = 'asset-item';

        if (state.openAssetId === a.id) {
            div.classList.add('active');
        }

        // ===== LEFT ICON =====
        const left = document.createElement('span');
        left.className = 'asset-left';

        if (state.repaired[a.id]) {
            left.innerText = '[!]';
        } else {
            left.innerText = '[ ]';
        }

        // ===== NAME =====
        const name = document.createElement('span');
        name.className = 'asset-name';
        name.innerText = `${index + 1}. ${a.name}`;

        // ===== RIGHT TEXT =====
        const right = document.createElement('span');
        right.className = 'asset-right';

        if (state.repaired[a.id]) {
            right.innerText = 'Đã báo lỗi >';
        } else {
            right.innerText = 'Bình thường';
        }

        div.appendChild(left);
        div.appendChild(name);
        div.appendChild(right);

        div.onclick = () => openRepair(a.id);

        el.appendChild(div);

        // ===== FORM =====
        if (state.openAssetId === a.id) {

            const form = document.createElement('div');
            form.className = 'repair-form';

            form.innerHTML = `
        <div class="repair-title">
          ${state.selectedRoom.room_code} - ${a.name}
        </div>

        <textarea id="desc-${a.id}" placeholder="Mô tả lỗi"></textarea>

        <div class="repair-actions">
          <div class="upload-box" onclick="triggerUpload('file-${a.id}')">
            + Thêm ảnh
          </div>
          <input type="file" id="file-${a.id}" hidden>

          <button class="btn btn-success" onclick="submitRepair(${a.id})">
            Lưu thông tin báo lỗi
          </button>
        </div>
      `;

            el.appendChild(form);

            setTimeout(() => {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    });
}

/* ================= REPAIR ================= */
function openRepair(assetId) {

    // 🔒 phòng done
    if (state.selectedRoom.status === 'done') {
        return showError('Phòng đã hoàn thành');
    }

    // 🔒 asset đã báo lỗi → KHÔNG mở lại
    if (state.repaired[assetId]) {
        return;
    }

    // toggle
    if (state.openAssetId === assetId) {
        state.openAssetId = null;
    } else {
        state.openAssetId = assetId;
    }

    renderAssets();
}
async function submitRepair(assetId) {

    const desc = document.getElementById(`desc-${assetId}`).value;
    if (!desc) {
        return showError('Nhập mô tả lỗi');
    }
    await api('/user/repairs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            room_id: state.selectedRoom.room_id,
            asset_type_id: assetId,
            issue_description: desc
        })
    });

    state.repaired[assetId] = true;
    state.openAssetId = null;
    showSuccess('Đã báo lỗi thiết bị');
    renderAssets();

}

/* ================= DONE ROOM ================= */
function showConfirm() {
    document.getElementById('confirmWrap').style.display = 'block';
}

async function confirmDoneRoom() {

    const fileInput = document.getElementById('roomImageInput');
    let fileId = null;

    if (fileInput.files.length) {
        fileId = await uploadFile(fileInput.files[0]);
    }

    await api(`/user/periodic-work/jobs/${state.jobId}/rooms/${state.selectedRoom.job_room_id}/done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            room_image_file_id: fileId
        })
    });
    if (state.selectedRoom.status !== 'done') {
        state.summary.done++;
    }

    // ===== UPDATE STATUS =====
    state.selectedRoom.status = 'done';

    // nếu có lỗi
    if (Object.keys(state.repaired).length > 0) {
        state.selectedRoom.has_error = true;
    }

    // ===== RESET UI =====
    state.openAssetId = null;
    state.assets = [];
    state.repaired = {};

    document.getElementById('assetList').innerHTML = '';
    document.getElementById('roomDetail').style.display = 'none';
    document.getElementById('confirmWrap').style.display = 'none';

    // ===== UPDATE GRID =====
    renderSummary(state.summary);
    renderRoomGrid();

    // ===== THÔNG BÁO =====
    showSuccess('Đã hoàn thành phòng');
    // ===== CHECK COMPLETE JOB =====
    if (state.summary.done >= state.summary.total) {

        showSuccess('Đã hoàn thành toàn bộ công việc');

        setTimeout(() => {
            window.location.href = '/tech/periodic-work';
        }, 1200);

        return;
    }
}

/* ================= UPLOAD ================= */
async function uploadFile(file) {

    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/files/upload?module_name=periodic', {
        method: 'POST',
        body: fd
    });

    const data = await res.json();
    return data.data.file_id;
}
function triggerUpload(id) {
    document.getElementById(id).click();
}
function nextFloor() {

    const floors = state.buildings[0].floors;
    const idx = floors.findIndex(f => f.id === state.selectedFloor.id);

    if (idx < floors.length - 1) {

        const next = floors[idx + 1];

        selectFloor(next);

        // 🔥 auto chọn room đầu tiên chưa done
        const firstPending = next.rooms.find(r => r.status !== 'done');

        if (firstPending) {
            selectRoom(firstPending);
        }
    } else {
        showSuccess('Đã hoàn thành tất cả các tầng');
    }
}

function prevFloor() {

    const floors = state.buildings[0].floors;
    const idx = floors.findIndex(f => f.id === state.selectedFloor.id);

    if (idx > 0) {
        selectFloor(floors[idx - 1]);
    }
}
function cancelConfirm() {
    document.getElementById('confirmWrap').style.display = 'none';
}
function updateLocation() {
    const building = state.buildings[0];
    const floor = state.selectedFloor;

    document.getElementById('locationInfo').innerText =
        `${building.name} - Tầng :  ${floor.name}`;
}
function renderFloorNav() {

    const floors = state.buildings[0].floors;
    const currentIdx = floors.findIndex(f => f.id === state.selectedFloor.id);

    const el = document.getElementById('floorList');
    el.innerHTML = '';

    // ===== luôn lấy 3 tầng, center current =====
    let start = currentIdx - 1;
    let end = currentIdx + 2;

    if (start < 0) {
        start = 0;
        end = Math.min(3, floors.length);
    }

    if (end > floors.length) {
        end = floors.length;
        start = Math.max(0, end - 3);
    }

    for (let i = start; i < end; i++) {

        const f = floors[i];

        const div = document.createElement('div');
        div.className = 'floor-item';

        if (f.id === state.selectedFloor.id) {
            div.classList.add('active');
        }

        div.innerText = f.name;

        div.onclick = () => selectFloor(f);

        el.appendChild(div);
    }

    // ===== disable nút =====
    document.getElementById('btnPrevFloor').disabled = currentIdx === 0;
    document.getElementById('btnNextFloor').disabled = currentIdx === floors.length - 1;
}
function renderJobTitle() {
    document.getElementById('jobTitle').innerText = state.job.title;
}
function bindFileInput() {
    const input = document.getElementById('roomImageInput')

    input.addEventListener('change', () => {
        selectedFiles.push(...Array.from(input.files))
        renderPreview()
        input.value = ''
    })
}

function renderPreview() {
    const el = document.getElementById('preview')
    el.innerHTML = ''

    selectedFiles.forEach((file, i) => {
        const div = document.createElement('div')
        const img = document.createElement('img')
        img.src = URL.createObjectURL(file)
        img.onclick = () => openPreview(img.src)
        const btn = document.createElement('button')
        btn.innerText = 'x'
        btn.onclick = () => {
            selectedFiles.splice(i, 1)
            renderPreview()
        }

        div.appendChild(img)
        div.appendChild(btn)
        el.appendChild(div)
    })
}
function openPreview(src) {
    const modal = document.getElementById('imgModal')
    const img = document.getElementById('imgPreviewLarge')

    img.src = src
    modal.classList.add('show');

    modal.onclick = () => {
        modal.classList.remove('show')
    }
}