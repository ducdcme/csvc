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
    loadRecent()
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

    renderList('Chọn thiết bị/CSVC', res.data, (a) => {
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

    document.getElementById('selectedInfo').innerText =
        `${state.building.name} - Phòng: ${state.room.code} - ${state.room.name} - TB/CSVC: ${state.asset.name}`
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
        if (!qty || qty < 1) throw new Error('Số lượng phải lớn hơn 0')

        btn.disabled = true
        btn.innerText = 'Đang gửi...'
        const fileIds = await uploadFiles()
        const attachments = fileIds.map(id => ({
            file_id: id
        }))
        if (attachments && !Array.isArray(attachments)) {
            throw new Error('attachments must be array');
        }

        await api('/api/repairs', {
            method: 'POST',
            body: JSON.stringify({
                room_id: state.room.id,
                asset_type_id: state.asset.id,
                quantity: qty,
                issue_description: desc,
                attachments
            })
        })

        showSuccess('Gửi thành công')
        setTimeout(() => backToRoom(), 2000)

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
                .slice(0, 6)

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
async function loadRecent() {

    const section = document.getElementById('recentSection')
    const list = document.getElementById('recentList')

    if (!section || !list) return

    try {

        const res = await api('/api/repairs/completed-recent')

        const data = res.data || []

        // 🔥 KHÔNG CÓ DATA → ẨN
        if (!data.length) {
            section.style.display = 'none'
            return
        }

        // 🔥 CÓ DATA → HIỆN
        section.style.display = 'block'

        list.innerHTML = ''

        data.forEach(r => {

            const div = document.createElement('div')
            div.className = 'recent-item'
            const room = state.rooms.find(x => String(x.room_id) === String(r.room_id))

            const roomName = room
                ? `${room.code} - ${room.name}`
                : '---'

            div.innerHTML = ` ${roomName} - ${r.asset_type_name} <span class="badge ${mapStatusClass(r.status)}">  ${mapStatus(r.status)}</span>`

            list.appendChild(div)
        })

    } catch (err) {
        console.error(err)

        // 🔥 lỗi → ẩn luôn
        section.style.display = 'none'
    }
}
function mapStatus(s) {
    if (s === 'hoan_thanh') return 'Đã sửa'
    if (s === 'dang_xu_ly') return 'Đang sửa'
    return 'Chờ tiếp nhận'
}

function mapStatusClass(s) {
    if (s === 'hoan_thanh') return 'done'
    if (s === 'dang_xu_ly') return 'fixing'
    return 'pending'
}
function normalizeText(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}
function highlight(text, keyword) {

    if (!keyword) return text

    const normalizedText = normalizeText(text)
    const normalizedKey = normalizeText(keyword)

    const index = normalizedText.indexOf(normalizedKey)

    if (index === -1) return text

    return text.substring(0, index)
        + "<mark>"
        + text.substring(index, index + keyword.length)
        + "</mark>"
        + text.substring(index + keyword.length)
}
function resetForm() {
    selectedFiles = []

    const preview = document.getElementById('preview')
    if (preview) preview.innerHTML = ''
    const qty = document.getElementById('quantity')
    if (qty) qty.value = '1'
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
document.addEventListener('DOMContentLoaded', init)