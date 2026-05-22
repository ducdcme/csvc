const PAGE_SIZE = 100

let raw = []
let filtered = []
let currentPage = 1
let isWorkMode = true
let keyword = ''
let currentFilter = 'pending' // default
let currentDetailId = null
let uploadedDetailFiles = []
let crState = {
    rooms: [],
    room: null,
    asset: null
}

let crFiles = []

document.addEventListener('DOMContentLoaded', init)

/* ================= INIT ================= */

async function init() {

    const res = await fetch('/user/repairs?limit=500')
    const json = await res.json()

    if (!json.success) return

    raw = json.data
    currentFilter = 'pending'
    toggleWorkMode(true)
    applyFilter()
    bindEvents()
    //render()
    bindDetailUpload()
}

/* ================= FILTER ================= */

function bindEvents() {

    document.getElementById('searchInput')
        .addEventListener('input', e => {
            keyword = e.target.value.toLowerCase()
            applyFilter()
        })

    renderStatusFilter()
}

function renderStatusFilter() {

    const list = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xử lý' },
        { key: 'processing', label: 'Đang xử lý' },
        { key: 'done', label: 'Hoàn thành' }
    ]

    document.getElementById('statusFilter').innerHTML =
        list.map(s => `
            <button class="page-btn ${currentFilter === s.key ? 'active' : ''}"
                onclick="setFilter('${s.key}')">
                ${s.label}
            </button>
        `).join('')
}

function setFilter(f) {
    currentFilter = f
    applyFilter()
    renderStatusFilter()
}

function applyFilter() {

    let data = [...raw]

    // 🔥 WORK MODE → override toàn bộ filter
    if (isWorkMode) {

        data = data
            .filter(r => r.status !== 'hoan_thanh')
    }

    // 🔥 FILTER MODE → dùng filter cũ
    else {

        data = data.filter(r => {

            let matchStatus = true

            if (currentFilter === 'pending') {
                matchStatus = r.status === 'cho_tiep_nhan'
            }
            else if (currentFilter === 'processing') {
                matchStatus = ['da_tiep_nhan', 'dang_xu_ly'].includes(r.status)
            }
            else if (currentFilter === 'done') {
                matchStatus = r.status === 'hoan_thanh'
            }

            const text = `${r.issue_description} ${r.room_code} ${r.room_name}`.toLowerCase()
            const matchKeyword = text.includes(keyword)

            return matchStatus && matchKeyword
        })
    }

    filtered = data

    currentPage = 1

    render()
    renderCompleted()
}
function toggleWorkMode(val) {

    isWorkMode = val

    const filterEl = document.getElementById('statusFilter')
    const searchEl = document.getElementById('searchInput')
    const completedSection = document.getElementById('completedSection')
    if (filterEl) {
        filterEl.style.display = val ? 'none' : 'block'
    }
    if (searchEl) {
        searchEl.style.display = val ? 'none' : 'block'
    }
    if (completedSection) {
        completedSection.style.display = val ? 'block' : 'none'
    }
    applyFilter()
}
/* ================= GROUP ================= */

function groupByRoom(data) {

    const map = {}

    data.forEach(r => {

        if (!map[r.room_code]) {
            map[r.room_code] = {
                label: `${r.room_code} - ${r.room_name}`,
                items: []
            }
        }

        map[r.room_code].items.push(r)
    })

    return Object.values(map)
}



/* ================= RENDER ================= */

function render() {

    const start = (currentPage - 1) * PAGE_SIZE
    const pageData = filtered.slice(start, start + PAGE_SIZE)

    const grouped = groupByRoom(pageData)

    const isMobile = window.innerWidth < 768

    const el = document.getElementById('repairList')

    if (isMobile) {
        // giữ nguyên mobile
        el.innerHTML = grouped.map(group => `
            <div class="card">
                <div class="room-title">${group.label}</div>
                ${group.items.map(renderCard).join('')}
            </div>
        `).join('')
        return
    }

    // 🔥 DESKTOP: 1 TABLE DUY NHẤT
    el.innerHTML = '<div class="card">' + renderGroupedTable(grouped) + '</div>'
}



/* ================= MOBILE ================= */

function renderCard(r) {

    let img = `<div class="no-img-thumb">no image</div>`
    if (r.file_id) {
        img = `<img src="/api/files/${r.file_id}" class="thumb" onclick="openImageViewer('${r.file_id}')" style="cursor: pointer;">`
    }

    return `
        <div class="repair-card">

            <div style="display:flex; justify-content:space-between;">

                <div style="flex:1;">

                    <!-- STATUS + TIME -->
                    <div style="display:flex; gap:10px; margin:6px 0;">
                        <span class="status ${mapClass(r.status)}">
                            ${mapText(r.status)}
                        </span>
                        <span style="color:#666;">
                            ${formatDateTime(r.created_at)}
                        </span>
                    </div>

                    <!-- ASSET -->
                    <div style="font-weight:600;">
                        ${r.asset_type_name || ''}
                    </div>

                    <!-- ISSUE -->
                    <div style="color:#555;">
                        ${r.issue_description}
                    </div>

                    <!-- ACTION -->
                    <div style="margin-top:10px;">
                        ${renderAction(r)}
                    </div>

                </div>

                <!-- IMAGE -->
                <div style="width:90px;">
                    ${img}
                </div>

            </div>

        </div>
    `
}



/* ================= DESKTOP ================= */

function renderTable(list, start) {

    return `
        <table class="table">

            <tr>
                <th>STT</th>
                <th>Phòng</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
            </tr>

            ${list.map((r, i) => `
                <tr>

                    <td>${start + i + 1}</td>

                    <td>${r.room_code} - ${r.room_name}</td>

                    <td>
                        <div><b>${r.asset_type_name || ''}</b></div>
                        <div>${r.issue_description}</div>
                    </td>

                    <td>${formatDateTime(r.created_at)}</td>

                    <td>
                        <span class="status ${mapClass(r.status)}">
                            ${mapText(r.status)}
                        </span>
                    </td>

                    <td>
                        ${renderAction(r)}
                    </td>

                </tr>
            `).join('')}

        </table>
    `
}
function renderGroupedTable(groups) {

    let index = 0

    return `
        <table class="table">

            <tr>
                <th>STT</th>
                <th>Phòng</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
            </tr>

            ${groups.map(group => `

                <!-- 🔵 ROW GROUP -->
                <tr class="room-row">
                    <td colspan="6">
                        <b>${group.label}</b>
                    </td>
                </tr>

                <!-- 🔵 ITEMS -->
                ${group.items.map(r => `
                    <tr>

                        <td>${++index}</td>

                        <td></td> <!-- bỏ room -->

                        <td>
                            <div><b>${r.asset_type_name || ''}</b></div>
                            <div>${r.issue_description}</div>
                        </td>

                        <td>${formatDateTime(r.created_at)}</td>

                        <td>
                            <span class="status ${mapClass(r.status)}">
                                ${mapText(r.status)}
                            </span>
                        </td>

                        <td>
                            ${renderAction(r)}
                        </td>

                    </tr>
                `).join('')}

            `).join('')}

        </table>
    `
}
function renderAction(r) {

    if (r.status === 'cho_tiep_nhan') {
        return `<button class="btn btn-success" onclick="receive(${r.id})">Nhận sửa</button>`
    }

    if (r.status === 'da_tiep_nhan') {
        return `<button class="btn btn-success" onclick="start(${r.id})">Bắt đầu</button>`
    }

    if (r.status === 'dang_xu_ly') {
        return `<button class="btn btn-success" onclick="event.stopPropagation(); complete(${r.id})">Hoàn thành</button>`
    }
    if (r.status === 'hoan_thanh') {
        const hasDetail = r.result_note || (r.attachments && r.attachments.length > 0)

        return `<button class="btn btn-primary" onclick="event.stopPropagation(); openDetail(${r.id})">
            ${hasDetail ? 'Xem chi tiết' : 'Thêm chi tiết'}
        </button>`
    }
    return ''
}
async function receive(id) {
    await fetch(`/user/repairs/${id}/receive`, { method: 'POST' })
    updateLocal(id, 'da_tiep_nhan')
}

async function start(id) {
    await fetch(`/user/repairs/${id}/start`, { method: 'POST' })
    updateLocal(id, 'dang_xu_ly')
}

async function complete(id) {
    await fetch(`/user/repairs/${id}/complete`, { method: 'POST' })
    updateLocal(id, 'hoan_thanh')
}

function updateLocal(id, newStatus) {

    raw = raw.map(r =>
        String(r.id) === String(id)
            ? { ...r, status: newStatus }
            : r
    )

    applyFilter() // đã gọi render bên trong flow
}

/* ================= PAGINATION ================= */

function renderPagination() {

    const totalPage = Math.ceil(filtered.length / PAGE_SIZE)

    document.getElementById('pagination').innerHTML =
        Array.from({ length: totalPage }, (_, i) => `
            <button class="page-btn ${i + 1 === currentPage ? 'active' : ''}"
                onclick="goPage(${i + 1})">${i + 1}</button>
        `).join('')
}

function goPage(p) {
    currentPage = p
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}



/* ================= NAV ================= */

function goDetail(id) {
    window.location.href = `/tech/repairs/${id}`
}



/* ================= HELPERS ================= */


// open detail complete
async function openDetail(id) {

    const res = await fetch(`/user/repairs/${id}`)
    const json = await res.json()

    if (!json.success) {
        alert('Lỗi')
        return
    }

    const r = json.data || {}

    const hasDetail = r.result_note || (r.attachments && r.attachments.length > 0)

    if (hasDetail) {
        renderViewDetail(r)
    } else {
        renderEditDetail(r)
    }

    document.getElementById('detailModal').classList.remove('hidden')
    document.getElementById('detailModal')?.addEventListener('click', closeDetail)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDetail()
    })
}
function closeDetail() {
    currentDetailId = null

    // reset note
    const noteEl = document.getElementById('detailNote')
    if (noteEl) noteEl.value = ''

    // reset file input
    const fileEl = document.getElementById('detailFiles')
    if (fileEl) fileEl.value = ''

    // reset state upload
    uploadedDetailFiles = []

    // clear preview
    const preview = document.getElementById('detailImages')
    if (preview) preview.innerHTML = ''

    // hide modal
    document.getElementById('detailModal').classList.add('hidden')
}
//Submit Detail
async function submitDetail() {

    const note = document.getElementById('detailNote').value

    const res = await fetch(`/user/repairs/${currentDetailId}/detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            result_note: note || null,
            attachments: uploadedDetailFiles
        })
    })

    const json = await res.json()

    if (!json.success) {
        alert(json.message || 'Có lỗi xảy ra')
        return
    }

    // 🔥 UPDATE LOCAL ĐẦY ĐỦ (QUAN TRỌNG)
    raw = raw.map(r => {
        if (String(r.id) === String(currentDetailId)) {
            return {
                ...r,
                result_note: note,
                attachments: [
                    ...(r.attachments || []),
                    ...uploadedDetailFiles.map(id => ({ file_id: id }))
                ]
            }
        }
        return r
    })

    applyFilter()

    closeDetail()
}
function bindDetailUpload() {

    const input = document.getElementById('detailFiles')

    if (!input) return

    input.addEventListener('change', async (e) => {

        const files = e.target.files
        uploadedDetailFiles = []

        for (const file of files) {

            const formData = new FormData()
            formData.append('file', file)
            formData.append('attachment_type', 'supporting_image')
            const res = await fetch('/api/files/upload?module_name=repair', {
                method: 'POST',
                body: formData
            })

            const json = await res.json()

            if (json.success) {
                uploadedDetailFiles.push(json.data.file_id)
            }
        }
    })
}
function openImageViewer(fileId) {

    const img = document.getElementById('viewerImg')

    img.src = `/api/files/${fileId}`

    document.getElementById('imageViewer')
        .classList.remove('hidden')
}

function closeImageViewer() {
    document.getElementById('imageViewer')
        .classList.add('hidden')
}

function renderViewDetail(r) {

    const html = `
        <div class="card-p">
            <b>${r.room_code || ''} - ${r.room_name || ''} - ${r.building_name || ''}</b>
            <div><b>Thiết bị:</b> ${r.asset_type_name || ''}</div>
            <div><b>Mô tả lỗi:</b> ${r.issue_description || ''}</div>
            <div><b>Trạng thái:</b> Đã sửa chữa</div>
            <div><b>Ghi chú:</b> ${r.result_note || '—'}</div>
            <div style="margin-top:10px;">
                ${(r.attachments || []).map(img => {
        const fid = img.file_id || img.id
        if (!fid) return ''
        return `<img src="/api/files/${fid}" class="thumb" onclick="openImageViewer(${fid})">`
    }).join('')}
            </div>
        </div>
    `

    document.getElementById('detailContent').innerHTML = html
}
function renderEditDetail(r) {

    const html = `
        <div class="card-p">
            <h2> Note sau sửa chữa</h2>
            <textarea id="detailNote" placeholder="Chi tiết sửa..."></textarea>

            <input type="file" id="detailFiles" multiple>

            <div id="detailImages"></div>

            <button onclick="submitDetail()" class="submit">Lưu</button>
        </div>
    `

    document.getElementById('detailContent').innerHTML = html

    // bind upload sau khi render
    bindDetailUpload()
}
function goCreateRepair() {
    window.location.href = '/tech/repairs/create'
}
function renderCompleted() {

    const list = raw
        .filter(r => r.status === 'hoan_thanh')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)

    if (list.length === 0) {
        document.getElementById('completedSection').innerHTML = ''
        return
    }
    if (isWorkMode) {

        const html = `
            <div class="section-title">Hoàn thành gần đây</div>

            <div class="completed-list">

                ${list.map(r => `
                    <div class="completed-row">

                        <div class="c-room">${r.room_code}-${r.room_name}</div>

                        <div class="c-asset">${r.asset_type_name}</div>

                        <div class="c-status">Hoàn thành</div>

                        <div class="c-time">${formatTime(r.created_at)}</div>

                    </div>
                `).join('')}

            </div>
        `

        document.getElementById('completedSection').innerHTML = html
        return
    }
    const isMobile = window.innerWidth < 768

    const html = `<div class="card">
        <div class="page-title">Hoàn thành gần đây</div>

        ${isMobile
            ? list.map(renderCard).join('')
            : renderTable(list, 0)
        }
    </div>`

    document.getElementById('completedSection').innerHTML = html
}