/**
 * REPAIR PAGE - SINGLE STEP FLOW
 */

let state = {
    buildings: [],
    building: null,
    floor: null,
    room: null,
    asset: null
}

let selectedFiles = []

async function init() {
    bindSearch()
    bindSubmit()
    bindFileInput()
    await loadLocation()
    state.rooms = buildRoomIndex(state.buildings)
}

/* =========================
   LOAD LOCATION
========================= */
async function loadLocation() {
    const res = await api('/api/location')

    state.buildings = res.data.map(b => ({
        id: b.building_id,
        name: b.building_name,
        floors: (b.floors || []).map(f => ({
            id: f.floor_id,
            name: f.floor_name,
            rooms: (f.rooms || []).map(r => ({
                id: r.room_id,
                code: r.room_code,
                name: r.room_name,
                type: 'room'
            }))
        }))
    }))

    renderBuildings()
}
function buildRoomIndex(buildings) {

    const rooms = []

    buildings.forEach(b => {
        b.floors.forEach(f => {
            f.rooms.forEach(r => {

                rooms.push({
                    id: r.id,
                    code: r.code,
                    name: r.name,
                    building: b.name,

                    searchText: normalizeText(
                        `${r.code} ${r.name} ${b.name}`
                    ),

                    buildingObj: b,
                    floorObj: f,
                    roomObj: r
                })

            })
        })
    })

    return rooms
}
/* =========================
   CORE RENDER
========================= */
function renderList(title, items, onClick) {
    document.getElementById('stepTitle').innerText = title

    const el = document.getElementById('stepList')
    el.innerHTML = ''

    items.forEach(item => {
        const btn = document.createElement('button')
        btn.className = 'chip'
        btn.innerText = item.type === 'room' ? `${item.code} - ${item.name}` : item.name

        btn.onclick = () => {
            setActive(el, btn)
            onClick(item)
        }

        el.appendChild(btn)
    })
}

function setActive(container, btn) {
    container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'))
    btn.classList.add('active')
}

/* =========================
   FLOW
========================= */

function renderBuildings() {
    renderList('Chọn tòa nhà', state.buildings, (b) => {
        state.building = b
        state.floor = null
        state.room = null
        state.asset = null

        if (!b.floors.length) {
            showError('Tòa nhà chưa có tầng')
            return
        }

        renderFloors(b.floors)
        updateBreadcrumb()
    })
}

function renderFloors(floors) {
    renderList('Chọn tầng', floors, (f) => {
        state.floor = f
        state.room = null
        state.asset = null

        renderRooms(f.rooms)
        updateBreadcrumb()
    })
}

function renderRooms(rooms) {
    renderList('Chọn phòng', rooms, (r) => {
        resetForm() // reset form khi chọn phòng mới
        state.room = r
        state.asset = null

        loadAssets(r.id)
        updateBreadcrumb()
    }, true)
}

async function loadAssets(roomId) {
    const res = await api(`/api/rooms/${roomId}/assets`)

    renderList('Chọn thiết bị', res.data, (a) => {
        resetForm() //
        state.asset = a

        showForm()
        updateBreadcrumb()
    })
}

/* =========================
   BREADCRUMB
========================= */
function updateBreadcrumb() {
    let text = "📍 "

    if (!state.building) text += "Chọn tòa nhà"
    else if (!state.floor) text += state.building.name + " › Chọn tầng"
    else if (!state.room) text += state.building.name + " › Tầng " + state.floor.name + " › Chọn phòng"
    else if (!state.asset) text += state.building.name + " › Tầng " + state.floor.name + " › " + state.room.code + " › Chọn thiết bị/CSVC"
    else text += `${state.building.name} › Tầng ${state.floor.name} › ${state.room.code} › ${state.asset.name}`

    document.getElementById('breadcrumb').innerText = text
}

/* =========================
   FORM
========================= */
function showForm() {
    document.getElementById('stepListContainer').style.display = 'none'
    document.getElementById('formSection').style.display = 'block'

    document.getElementById('selectedInfo').innerHTML =
        `<p>Vị trí: <b>${state.building.name} - Phòng: ${state.room.code} - ${state.room.name} </b></p>
        <p>Thiết bị/CSVC: <b>${state.asset.name}</b></p>`
}
function backToRoom() {
    document.getElementById('formSection').style.display = 'none'
    document.getElementById('stepListContainer').style.display = 'block'

    renderBuildings()
    document.getElementById('breadcrumb').innerText = "📍 Chọn tòa nhà"
}
/* =========================
   FILE
========================= */
function bindFileInput() {
    const input = document.getElementById('fileInput')

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

async function uploadFiles() {

    if (!selectedFiles.length) return []

    try {

        const uploads = selectedFiles.map(file => {

            const formData = new FormData()
            formData.append('file', file)

            return api('/api/files/upload?module_name=repair', {
                method: 'POST',
                body: formData
            }).then(res => res.data.file_id)

        })

        // 🔥 upload song song
        return await Promise.all(uploads)

    } catch (err) {

        showError('Upload file thất bại')

        throw err
    }
}

/* =========================
   SUBMIT
========================= */
function bindSubmit() {
    document.getElementById('submitBtn').onclick = submit
}

async function submit() {
    const btn = document.getElementById('submitBtn')

    try {
        if (!state.room) throw new Error('Chọn phòng')
        if (!state.asset) throw new Error('Chọn thiết bị')

        const desc = document.getElementById('desc').value.trim()
        const qty = Number(document.getElementById('quantity').value.trim())
        if (!desc) throw new Error('Nhập mô tả')
        if (!qty || qty <= 0) throw new Error('Nhập số lượng > 0')

        btn.disabled = true
        btn.innerText = 'Đang gửi...'
        const fileIds = await uploadFiles()
        const attachments = fileIds.map(id => ({
            file_id: id
        }))
        if (attachments && !Array.isArray(attachments)) {
            throw new Error('attachments must be array');
        }

        await api('/user/repairs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: state.room.id,
                asset_type_id: state.asset.id,
                issue_description: desc,
                quantity: qty,
                rp_source:"user",
                attachments: fileIds.map(id => ({ file_id: id }))
            })
        })

        showSuccess('Gửi thành công')
        setTimeout(() => window.location.href = '/tech/repairs', 2000)

    } catch (err) {
        showError(err.message)
    } finally {
        btn.disabled = false
        btn.innerText = 'Gửi báo hỏng'
    }
}

/* =========================
   UI
========================= */
function showError(msg) {
    document.getElementById('errorBox').innerText = msg
}

function showSuccess(msg) {
    document.getElementById('successBox').innerText = msg
}

function bindSearch() {

    const input = document.getElementById('searchRoom')
    const box = document.getElementById('searchResult')
    input.addEventListener('focus', () => {
        if (input.value) {
            input.select()
        }
        backToRoom()
    })
    if (!input || !box) return

    let timer

    input.addEventListener('input', () => {

        clearTimeout(timer)

        timer = setTimeout(() => {

            const val = input.value.trim()
            const keyword = normalizeText(val)

            box.innerHTML = ''

            if (!val) return

            const results = state.rooms
                .filter(r => r.searchText.includes(keyword))
                .sort((a, b) => {
                  const indexA = a.searchText.indexOf(keyword);
                  const indexB = b.searchText.indexOf(keyword);
                  return indexA - indexB; 
                 })
                .slice(0, 15)

            results.forEach(r => {

                const div = document.createElement('div')
                div.className = 'result'

                div.innerHTML = `
<div class="room">${highlight(r.code + ' - ' + r.name, val)}</div>
<div class="status">${r.building}</div>
`

                div.onclick = () => selectRoomFromSearch(r, input, box)

                box.appendChild(div)
            })

        }, 150)
    })
}
function selectRoomFromSearch(r, input, box) {

    state.building = r.buildingObj
    state.floor = r.floorObj
    state.room = r.roomObj

    loadAssets(r.id)
    updateBreadcrumb()

    input.value = `${r.code} - ${r.name}`
    box.innerHTML = ''
}

function resetForm() {
    selectedFiles = []

    const preview = document.getElementById('preview')
    if (preview) preview.innerHTML = ''

    const desc = document.getElementById('desc')
    if (desc) desc.value = ''

    const fileInput = document.getElementById('fileInput')
    if (fileInput) fileInput.value = ''
}
function openPreview(src) {
    const modal = document.getElementById('previewModal')
    const img = document.getElementById('previewModalImg')

    img.src = src
    modal.classList.add('show')

    modal.onclick = () => {
        modal.classList.remove('show')
    }
}
function formatRoom(r) {
    return `${r.room_code} - ${r.room_name}`
}
function triggerUpload(id) {
    document.getElementById(id).click();
}
  // Hàm tăng giảm số lượng
function changeValue(step) {
            const input = document.getElementById('quantity');
            let val = parseInt(input.value) || 1;
            val += step;
            if (val < 1) val = 1;
            input.value = val;
        }
document.addEventListener('DOMContentLoaded', init)