document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

async function initDashboard() {

    await Promise.all([
        loadHealth(),
        loadSummary(),
        loadMonthlyTasks(),
        loadRecentCompleted()
    ]);
}

async function loadHealth() {

    const res = await fetch('/user/dashboard/health')
    const json = await res.json()

    if (!json.success) return

    renderHealth(json.data)
}

function renderHealth(data) {

    const el = document.getElementById('healthContainer')

    if (!el) return
    if (data.holiday) {

        el.innerHTML = `
    
         <div class="safety-center is-safe">
                <div class="safety-visual">
                    <span class="material-icons">security</span>
                    <div class="status-glow"></div>
                </div>
               <h1 class="safety-text">HỆ THỐNG AN TOÀN</h1>
               <span class="safety-desc">Hôm qua là ngày nghỉ </span>

            </div>

        </div
    `

        return
    }

    if (data.safe) {

        el.innerHTML = `
        
            <div class="safety-center is-safe">
                <div class="safety-visual">
                    <span class="material-icons">security</span>
                    <div class="status-glow"></div>
                </div>
               <h1 class="safety-text">HỆ THỐNG AN TOÀN</h1>
               <span class="safety-desc">Đã hoàn thành kiểm tra ngăn ngừa rủi ro</span>

            </div>
        `

        return
    }

    el.innerHTML = `
    
        <div class="safety-center is-danger">

            <div class="safety-visual">
                    <span class="material-icons">security</span>
                    <div class="status-glow"></div>
                </div>
               <h1 class="safety-text">CẢNH BÁO</h1>
                <span class="safety-desc">Chưa hoàn thành kiểm tra ngăn ngừa rủi ro</span>
            </div>

        </div>
    `
}
async function loadSummary() {

    const res = await fetch('/user/dashboard/summary')
    const json = await res.json()

    if (!json.success) return

    renderSummary(json.data)
    renderChart(json.data)
}
function renderSummary(data) {

    const el = document.getElementById('summaryContainer')

    if (!el) return

    el.innerHTML = `
    
        <div class="dashboard-grid">
            <div class="stat-grid">
                <div class="stat-box stat-blue" onclick="location.href='/tech/repairs'">
                    <div class="stat-title">Sửa chữa tháng này</div>
                    <div class="stat-value">${data.repair.total}</div>
                    <div class="stat-sub">Chờ: ${data.repair.pending}</div>
                    <div class="stat-sub">Đang xử lý: ${data.repair.processing}</div>
                    <div class="stat-sub">Hoàn thành: ${data.repair.done}</div>
                </div>

                <div class="stat-box stat-orange" onclick="location.href='/tech/periodic-work'">
                    <div class="stat-title">Định kỳ tháng này</div>
                    <div class="stat-value">${data.periodic.total}</div>
                    <div class="stat-sub">Chờ: ${data.periodic.pending}</div>
                    <div class="stat-sub">Quá hạn: ${data.periodic.overdue}</div>
                    <div class="stat-sub">Hoàn thành: ${data.periodic.done}</div>
                </div>

                <div class="stat-box stat-green" onclick="location.href='/tech/incident-work'">
                    <div class="stat-title">Phát sinh tháng này</div>
                    <div class="stat-value">${data.incident.total}</div>
                    <div class="stat-sub">Mới: ${data.incident.pending}</div>
                    <div class="stat-sub">Đang xử lý: ${data.incident.processing}</div>
                    <div class="stat-sub">Hoàn thành: ${data.incident.done}</div>
                </div>
            </div>
        </div>
    `
}
let dashboardChart = null

function renderChart(data) {

    const ctx =
        document.getElementById('dashboardChart')

    if (!ctx) return

    if (dashboardChart) {
        dashboardChart.destroy()
    }

    dashboardChart = new Chart(ctx, {

        type: 'bar',

        data: {

            labels: [
                'Sửa chữa',
                'Định kỳ',
                'Phát sinh'
            ],

            datasets: [

                {
                    label: 'Chờ',

                    data: [
                        data.repair.pending,
                        data.periodic.pending,
                        data.incident.pending
                    ]
                },

                {
                    label: 'Đang xử lý',

                    data: [
                        data.repair.processing,
                        data.periodic.overdue,
                        data.incident.processing
                    ]
                },

                {
                    label: 'Hoàn thành',

                    data: [
                        data.repair.done,
                        data.periodic.done,
                        data.incident.done
                    ]
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                x: {
                    stacked: true
                },

                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    })
}
async function loadMonthlyTasks() {

    const res = await fetch('/user/dashboard/monthly-tasks')
    const json = await res.json()

    if (!json.success) return

    renderMonthlyTasks(json.data)
}
function renderMonthlyTasks(list) {

    const el = document.getElementById('monthlyTaskContainer')

    if (!el) return

    if (!list.length) {

        el.innerHTML = `
            <div class="empty">
                Không có công việc
            </div>
        `

        return
    }

    el.innerHTML = list.map(item => `
    
        <div class="item">

            <div class="item-left">
                <div class="icon-box ${mapModuleColor(item.module)}">
                    <span class="material-icons">${mapModuleIcon(item.module)}</span>
                </div>
                <div>
                    <div class="item-title">
                        ${mapModule(item.module)} : ${item.title}

                    </div>
                    <div class="item-sub">Thời hạn hoàn thành:<span class="tag ">${formatDate(item.date)}</span></div>
                </div>
            </div>
            <div class="icon-box" onclick="location.href='${item.url}'" style="cursor:pointer">
                <span class="material-icons">fast_forward</span>
            </div>
        </div>

    `).join('')

}
async function loadRecentCompleted() {

    const res = await fetch('/user/dashboard/recent-completed')
    const json = await res.json()

    if (!json.success) return

    renderRecentCompleted(json.data)
}
function renderRecentCompleted(list) {

    const el = document.getElementById('recentContainer')

    if (!el) return

    if (!list.length) {

        el.innerHTML = `
            <div class="empty">
                Chưa có dữ liệu
            </div>
        `

        return
    }

    el.innerHTML = list.map(item => `
    
        <div class="item" onclick="location.href='${item.url}'">

            <div class="item-left">
                <div class="icon-box ${mapModuleColor(item.module)}">
                    <span class="material-icons">${mapModuleIcon(item.module)}</span>
                </div>
                <div>
                    <div class="item-title">
                        ${mapModule(item.module)} : ${item.title}
                        <span class="tag ">${formatDate(item.time)}</span>
                    </div>
                    <div class="item-sub">${item.location}</div>
                </div>  
            </div>


        </div>

    `).join('')
}
// HELPER
function mapStatus(status) {

    switch (status) {

        case 'overdue':
            return 'overdue'

        case 'processing':
            return 'processing'

        case 'done':
            return 'done'

        default:
            return 'pending'
    }
}
function mapModule(module) {
    switch (module) {
        case 'repair':
            return 'Sửa chữa'
        case 'maintenance':
            return 'Bảo trì'
        case 'operation':
            return 'Vận hành'
        case 'incident-work':
            return 'Phát sinh'
        default:
            return 'CSVC'
    }
}
function mapModuleColor(module) {
    switch (module) {
        case 'repair':
            return 'icon-red'
        case 'maintenance':
            return 'icon-orange'
        case 'operation':
            return 'icon-green'
        case 'incident-work':
            return 'icon-yellow'
        default:
            return 'icon-blue'
    }
}
function mapModuleIcon(module) {
    switch (module) {
        case 'repair':
            return 'home_repair_service'
        case 'operation':
            return 'settings_input_component'
        case 'maintenance':
            return 'build_circle'
        case 'incident-work':
            return 'add_task'
        default:
            return 'event' //inspection
    }
}

