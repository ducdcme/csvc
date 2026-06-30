let state = {
    jobId: null,
    buildings: [],
    selectedFloor: null,
    selectedRoom: null,
    assets: [],
    repaired: {},
    openAssetId: null,
    readonly: false
};

let selectedFiles = [];
let repairFiles = {}; 
// {
//   assetId: [File, File]
// }
let isSubmittingRepair = {};
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
    state.readonly = state.job.status === 'done';
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
        if (state.readonly) {
            div.onclick = () => selectRoom(r);

        } else {
             // disable nếu done
             if (r.status !== 'done') {
              div.onclick = () => selectRoom(r);
             } else {
                 div.classList.add('disabled');
             }
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

    // ===== EDIT MODE =====
    if (!state.readonly && room.status === 'done') {
        showError('Phòng đã hoàn thành');
        return;
    }

    if (
        !state.selectedRoom ||
        state.selectedRoom.job_room_id !== room.job_room_id
    ) {

        state.openAssetId = null;
        state.assets = [];
        state.repaired = {};

        document.getElementById('assetList').innerHTML = '';

        // reset upload preview
        selectedFiles = [];
        renderPreview();
    }

    document.getElementById('confirmWrap').style.display = 'none';

    state.selectedRoom = room;

    updateLocation();

    document.getElementById('roomDetail').style.display = 'block';

    document.getElementById('roomTitle').innerText =
        `${room.room_code} - ${room.room_name}`;

    // reset view
    document.getElementById('roomImageSection').style.display = '';
    document.getElementById('roomUploadSection').style.display = '';
    document.getElementById('roomImageView').style.display = 'none';
    document.getElementById('roomImageView').innerHTML = '';

    document.getElementById('roomActionSection').style.display = '';

    await loadAssets(room.room_id);

    renderReadonlyRoom();
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

    const readonlyErrors =
        state.selectedRoom?.error_asset_ids || [];

    state.assets.forEach((a, index) => {

        const div = document.createElement('div');
        div.className = 'asset-item';

        // ===== VIEW / EDIT STATUS =====
        const hasError = state.readonly
            ? readonlyErrors.includes(a.id)
            : !!state.repaired[a.id];

        if (state.readonly) {
            div.classList.add(
                hasError
                    ? 'asset-error'
                    : 'asset-ok'
            );
        } else if (state.openAssetId === a.id) {
            div.classList.add('active');
        }

        // ===== LEFT =====
        const left = document.createElement('span');
        left.className = 'asset-left';

        if (hasError) {
            left.innerText = '[!]';
        } else {
            left.innerText = '[ ]';
        }

        // ===== NAME =====
        const name = document.createElement('span');
        name.className = 'asset-name';
        name.innerText = `${index + 1}. ${a.name}`;

        // ===== RIGHT =====
        const right = document.createElement('span');
        right.className = 'asset-right';

        if (hasError) {

            right.innerText = state.readonly
                ? 'Đã phát hiện lỗi'
                : 'Đã báo lỗi >';

        } else {

            right.innerText = 'Bình thường';

        }

        div.appendChild(left);
        div.appendChild(name);
        div.appendChild(right);

        // ===== CLICK =====
        if (!state.readonly) {
            div.onclick = () => openRepair(a.id);
        }

        el.appendChild(div);

        // ===== REPAIR FORM (EDIT MODE ONLY) =====
        if (!state.readonly && state.openAssetId === a.id) {

            const form = document.createElement('div');
            form.className = 'repair-form';

            form.innerHTML = `
                <div id="formSection">

                    <div class="repair-title">
                        <p>${state.selectedRoom.room_code} - ${a.name}</p>
                    </div>

                    <div class="form-group">
                        <button
                            type="button"
                            class="qty-btn"
                            onclick="changeValue(-1,'qty-${a.id}')">
                            −
                        </button>

                        <input
                            id="qty-${a.id}"
                            type="number"
                            value="1"
                            class="quantity"
                            readonly>

                        <button
                            type="button"
                            class="qty-btn"
                            onclick="changeValue(1,'qty-${a.id}')">
                            +
                        </button>
                    </div>

                    <div class="form-group">
                        <textarea
                            id="desc-${a.id}"
                            placeholder="Mô tả lỗi"></textarea>
                    </div>

                </div>

                <div class="repair-actions">

                    <div
                        class="upload-box"
                        onclick="triggerUpload('file-${a.id}')">
                        + Thêm ảnh
                    </div>

                    <input
                        type="file"
                        id="file-${a.id}"
                        accept="image/*"
                        multiple
                        hidden>

                    <div
                        id="preview-${a.id}"
                        class="repair-preview">
                    </div>

                    <button
                        id="submit-repair-${a.id}"
                        class="btn btn-success"
                        onclick="submitRepair(${a.id})">

                        Lưu thông tin báo lỗi

                    </button>

                </div>
            `;

            el.appendChild(form);

            bindRepairFileInput(a.id);

            renderRepairPreview(a.id);

            setTimeout(() => {
                form.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    });
}

/* ================= REPAIR ================= */
function openRepair(assetId) {

    // ===== VIEW MODE =====
    if (state.readonly) {
        return;
    }

    // 🔒 phòng done
    if (state.selectedRoom.status === 'done') {
        return showError('Phòng đã hoàn thành');
    }

    // 🔒 asset đã báo lỗi
    if (state.repaired[assetId]) {
        return;
    }

    if (state.openAssetId === assetId) {
        state.openAssetId = null;
    } else {
        state.openAssetId = assetId;
    }

    renderAssets();
}
async function submitRepair(assetId) {

    if (isSubmittingRepair[assetId]) {
        return;
    }

    const btn = document.getElementById(`submit-repair-${assetId}`);

    try {

        isSubmittingRepair[assetId] = true;

        btn.disabled = true;
        btn.innerText = 'Đang gửi...';

        const qty = document.getElementById(`qty-${assetId}`).value;

        if (!qty) {
            return showError('Hãy nhập số lượng');
        }

        const desc = document.getElementById(`desc-${assetId}`).value;

        if (!desc) {
            return showError('Nhập mô tả lỗi');
        }

        const fileIds = await uploadRepairFiles(assetId);

        await api('/user/repairs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: state.selectedRoom.room_id,
                asset_type_id: assetId,
                issue_description: desc,
                quantity: qty,
                rp_source: "jr",
                attachments: fileIds.map(id => ({
                    file_id: id
                }))
            })
        });

        delete repairFiles[assetId];

        state.repaired[assetId] = true;
        state.openAssetId = null;

        showSuccess('Đã báo lỗi thiết bị');

        renderAssets();

    } catch (err) {

        showError(err.message || 'Có lỗi xảy ra');

    } finally {

        isSubmittingRepair[assetId] = false;

        if (btn) {
            btn.disabled = false;
            btn.innerText = 'Lưu thông tin báo lỗi';
        }
    }
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
            room_image_file_id: fileId,
            error_asset_ids: Object.keys(state.repaired)
            .filter(assetId => state.repaired[assetId])
            .map(assetId => Number(assetId))
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
function changeValue(step,id)
{
    const input= document.getElementById(id)
    let val = parseInt(input.value) || 1;
            val += step;
            if (val < 1) val = 1;
            input.value = val;
        
}
function bindRepairFileInput(assetId) {

    const input = document.getElementById(`file-${assetId}`);

    if (!input) return;

    input.onchange = () => {

        if (!repairFiles[assetId]) {
            repairFiles[assetId] = [];
        }

        repairFiles[assetId].push(...Array.from(input.files));

        renderRepairPreview(assetId);

        input.value = '';
    };
}
function renderRepairPreview(assetId) {

    const el = document.getElementById(`preview-${assetId}`);

    if (!el) return;

    el.innerHTML = '';

    const files = repairFiles[assetId] || [];

    files.forEach((file, index) => {

        const div = document.createElement('div');
        div.className = 'preview-item';

        const img = document.createElement('img');

        img.src = URL.createObjectURL(file);

        img.onclick = () => openPreview(img.src);

        const btn = document.createElement('button');

        btn.innerText = 'x';

        btn.onclick = () => {

            repairFiles[assetId].splice(index, 1);

            renderRepairPreview(assetId);
        };

        div.appendChild(img);
        div.appendChild(btn);

        el.appendChild(div);
    });
}
async function uploadRepairFiles(assetId) {

    const files = repairFiles[assetId] || [];

    if (!files.length) return [];

    try {

        const uploads = files.map(file => {

            const formData = new FormData();

            formData.append('file', file);

            return api('/api/files/upload?module_name=repair', {
                method: 'POST',
                body: formData
            }).then(res => res.data.file_id);

        });

        return await Promise.all(uploads);

    } catch (err) {

        showError('Upload file thất bại');

        throw err;
    }
}

function renderReadonlyRoom() {

    if (!state.readonly) {
        return;
    }

    document.getElementById('roomActionSection').style.display = 'none';

    document.getElementById('roomUploadSection').style.display = 'none';

    const section = document.getElementById('roomImageSection');

    const view = document.getElementById('roomImageView');

    section.style.display = '';

    view.style.display = 'none';

    view.innerHTML = '';

    if (state.selectedRoom.room_image_file_id) {

        view.style.display = '';

        view.innerHTML = `
            <img
                class="room-view-image"
                src="/api/files/${state.selectedRoom.room_image_file_id}"
                onclick="openPreview('/api/files/${state.selectedRoom.room_image_file_id}')">
        `;

    } else {

        section.style.display = 'none';

    }
}