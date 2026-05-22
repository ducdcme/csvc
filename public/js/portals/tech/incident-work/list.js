const STATUS_LABEL = {
    OPEN: 'Mới tạo',
    CONTRACTING: 'Chọn thầu',
    PLANNING: 'Kế hoạch',
    IN_PROGRESS: 'Đang thực hiện',
    REVIEWING: 'Nghiệm thu',
    CLOSED: 'Hoàn thành'
};

async function loadIncidentWorks() {

    const res = await fetch('/user/incident-work');

    const json = await res.json();

    if (!json.success) {
        alert(json.message || 'Load failed');
        return;
    }

    const data = json.data || {};

    renderSummary(data.summary || {});

    renderSections(data);
}

function renderSummary(summary) {

    document.getElementById('sumInternal').innerText =
        summary.internal || 0;

    document.getElementById('sumExternal').innerText =
        summary.external || 0;

    document.getElementById('sumOverdue').innerText =
        summary.overdue || 0;
}
function renderSections(data) {

    const container =
        document.getElementById('incidentSections');

    container.innerHTML = '';

    const sections = [

        {
            title: 'Công việc thực hiện bởi Phòng vận hành',
            rows: data.internal || []
        },

        {
            title: 'Công việc do nhà thầu thực hiện',
            rows: data.external || []
        },

        {
            title: 'Hoàn thành gần đây',
            rows: data.recent_closed || []
        }
    ];

    sections.forEach(section => {

        if (!section.rows.length) {
            return;
        }

        container.innerHTML += `
            <div class="iw-section">

                <div class="iw-section-title">
                    ${section.title}
                </div>

                <div class="iw-list">
                    ${section.rows.map(renderCard).join('')}
                </div>

            </div>
        `;
    });

    if (!container.innerHTML.trim()) {

        container.innerHTML = `
            <div class="iw-empty">
                Không có công việc phát sinh
            </div>
        `;
    }
}

function renderCard(item) {

    const overdueClass =
        item.overdue ? 'iw-card-overdue' : '';

    const overdueBadge =
        item.overdue
            ? `<div class="iw-overdue">Quá hạn</div>`
            : '';

    return `
        <div
            class="iw-card ${overdueClass}"
            onclick="openDetail(${item.id})">

            <div class="iw-card-top">

                <div class="iw-card-title">
                    ${item.title}
                </div>

                <div class="iw-status">
                    ${STATUS_LABEL[item.status] || item.status}
                </div>

            </div>

            <div class="iw-card-description">
                ${item.description || ''}
            </div>

            ${item.work_type === 'EXTERNAL'
            ? `
                    <div class="iw-contractor">
                        Nhà thầu: ${item.contractor_id || '-'}
                    </div>
                `
            : ''
        }

            <div class="iw-progress">

                <div class="iw-progress-info">
                    ${item.progress.done}/${item.progress.total}
                </div>

                <div class="iw-progress-bar">
                    <div
                        class="iw-progress-fill"
                        style="width:${item.progress.percent}%">
                    </div>
                </div>

            </div>

            <div class="iw-card-footer">

                <div>
                    Hạn:
                    ${formatDate(item.due_date)}
                </div>

                ${overdueBadge}

            </div>

        </div>
    `;
}

function openDetail(id) {
    window.location =
        `/tech/incident-work/${id}`;
}

function formatDate(date) {

    if (!date) return '-';

    return new Date(date)
        .toLocaleDateString('vi-VN');
}
async function initIncidentPage() {

    await initPermissionSystem()

    await loadIncidentWorks()
}

initIncidentPage();