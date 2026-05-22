const STATUS_LABEL = {
    OPEN: 'Mới tạo',
    CONTRACTING: 'Thuê thầu',
    PLANNING: 'Lập kế hoạch',
    IN_PROGRESS: 'Đang thực hiện',
    REVIEWING: 'Chờ nghiệm thu',
    CLOSED: 'Hoàn thành'
};
const INCIDENT_ID = getIncidentId()

async function loadDetail() {

    try {

        const res = await fetch(
            `/user/incident-work/${INCIDENT_ID}`
        );

        const json = await res.json();

        if (!json.success) {
            throw new Error(json.message);
        }

        renderDetail(json.data);

    } catch (e) {

        document.getElementById('iwdLoading')
            .innerHTML = `
                <div class="iwd-error">
                    ${e.message || 'Load failed'}
                </div>
            `;
    }
}

function renderDetail(data) {

    window.INCIDENT_STATUS =
        data.incident.status;

    document.getElementById('iwdLoading')
        .style.display = 'none';

    const html = [

        renderHeader(data.incident),

        renderProgress(data.progress),

        renderStateBanner(data.incident),

        renderChecklist(data.checklist),

        renderExecuteModal()

    ]
        .filter(Boolean)
        .join('');

    document.getElementById('iwdContent')
        .innerHTML = html;
}

function renderHeader(incident) {

    if (!incident) {
        return '';
    }

    const typeLabel =
        incident.work_type === 'INTERNAL'
            ? 'NỘI BỘ'
            : 'NHÀ THẦU';

    const contractorHtml =
        incident.contractor_name
            ? `
            <div class="iwd-meta-item">

                <div class="iwd-meta-label">
                    Nhà thầu
                </div>

                <div class="iwd-meta-value">
                    ${incident.contractor_name}
                </div>

                ${incident.contractor_contact
                ? `
                        <div class="iwd-meta-sub">
                            Liên hệ:
                            ${incident.contractor_contact}
                        </div>
                    `
                : ''
            }

                ${incident.contractor_phone
                ? `
                        <div class="iwd-meta-sub">
                            SĐT:
                            ${incident.contractor_phone}
                        </div>
                    `
                : ''
            }

            </div>
        `
            : '';

    const overdueHtml =
        incident.overdue
            ? `
                <div class="iwd-overdue">
                    ⚠ Công việc quá hạn
                </div>
            `
            : '';

    return `
        <div class="iwd-hero">

            <div class="iwd-breadcrumb">
                Công việc phát sinh
            </div>

            <div class="iwd-hero-top">

                <div class="iwd-hero-main">

                    <div class="iwd-type-chip">
                        ${typeLabel}
                    </div>

                    <div class="iwd-title">
                        ${incident.title || '-'}
                    </div>

                    ${incident.description
            ? `
                            <div class="iwd-description">
                                ${incident.description}
                            </div>
                        `
            : ''
        }

                </div>

                <div class="iwd-status-large">
                    ${STATUS_LABEL[incident.status]
        || incident.status}
                </div>

            </div>

            <div class="iwd-meta-grid">

                <div class="iwd-meta-item">

                    <div class="iwd-meta-label">
                        Hạn thực hiện
                    </div>

                    <div class="iwd-meta-value">
                        ${formatDate(incident.due_date)}
                    </div>

                </div>

                ${contractorHtml}

            </div>

            ${overdueHtml}

        </div>
    `;
}

function renderProgress(progress) {

    if (!progress || !progress.total) {
        return '';
    }

    return `
        <div class="iwd-progress-card">

            <div class="iwd-progress-top">

                <div>

                    <div class="iwd-progress-title">
                        Tiến độ thực hiện
                    </div>

                    <div class="iwd-progress-sub">
                        ${progress.done}/${progress.total}
                        checklist hoàn thành
                    </div>

                </div>

                <div class="iwd-progress-percent">
                    ${progress.percent}%
                </div>

            </div>

            <div class="iwd-progress-bar">

                <div
                    class="iwd-progress-fill"
                    style="width:${progress.percent}%">
                </div>

            </div>

        </div>
    `;
}
function renderStateBanner(incident) {

    if (!incident) {
        return '';
    }

    let text = '';

    if (incident.status === 'REVIEWING') {
        text = 'Công việc đang chờ nghiệm thu';
    }

    if (incident.status === 'CLOSED') {
        text = 'Công việc đã hoàn thành';
    }

    if (
        incident.status !== 'IN_PROGRESS' &&
        incident.status !== 'REVIEWING' &&
        incident.status !== 'CLOSED'
    ) {
        text = 'Công việc chưa bắt đầu thực hiện';
    }

    if (!text) {
        return '';
    }

    return `
        <div class="iwd-state-banner">
            ${text}
        </div>
    `;
}

function renderChecklist(rows) {

    if (!rows || !rows.length) {
        return '';
    }

    return `
        <div class="iwd-section">

            <div class="iwd-section-title">
                Checklist thực hiện
            </div>

            <div class="iwd-checklist">

                ${rows.map(renderChecklistItem).join('')}

            </div>

        </div>
    `;
}

function renderChecklistItem(item) {

    const canExecute =
        window.INCIDENT_STATUS === 'IN_PROGRESS';

    // completed
    if (item.completed) {

        return `
            <div class="iwd-item iwd-item-done">

                <div class="iwd-item-top">

                    <div class="iwd-item-name">
                        ✓ ${item.name}
                    </div>

                    <div class="iwd-item-badge">
                        Hoàn thành
                    </div>

                </div>

                <div class="iwd-item-meta">

                    <div>
                        <strong>Thực hiện:</strong>
                        ${item.log.done_by_name || '-'}
                    </div>

                    <div>
                        <strong>Thời gian:</strong>
                        ${formatDateTime(
            item.log.created_at
        )}
                    </div>
                    ${item.log.note && item.log.note.trim().length > 0
                ? `
                            <div>
                                <strong>Ghi chú:</strong>
                                ${item.log.note}
                            </div>
                        `
                : ''
            }

            ${renderAttachmentPreview(item.log.attachment_ids)}

                </div>

            </div>
        `;
    }

    // pending
    return `
        <div class="iwd-item">

            <div class="iwd-item-top">

                <div>

                    <div class="iwd-item-name">
                        ○ ${item.name}
                    </div>

                    <div class="iwd-item-pending">
                        Chưa thực hiện
                    </div>

                </div>

                ${canExecute
            ? `
                        <button
                            class="iwd-execute-btn"
                            onclick="openExecuteModal(${item.id})">

                            Thực hiện

                        </button>
                    `
            : ''
        }

            </div>

        </div>
    `;
}
function renderAttachmentPreview(ids = []) {

    if (!ids.length) {
        return '';
    }

    return `
        <div class="iwd-attachments">

            ${ids.map(id => `
                <img
                    src="/api/files/${id}"
                    class="iwd-thumb"
                    onclick="openImageViewer(${id})">
            `).join('')}

        </div>
    `;
}
function renderExecuteModal() {

    return `
        <div
            id="executeModal"
            class="iwd-modal"
            style="display:none;">

            <div class="iwd-modal-content">

                <div class="iwd-modal-title">
                    Hoàn thành checklist
                </div>

                <textarea
                    id="executeNote"
                    class="iwd-textarea"
                    placeholder="Ghi chú thực hiện">
                </textarea>
                <div class="upload-box" onclick="document.getElementById('executeFiles').click()"><span>Thêm ảnh</span>
                    <input
                    id="executeFiles"
                    type="file"
                    multiple
                    accept="image/*"
                    onchange="previewExecuteImages(event)" hidden>
                </div>
                <div
                    id="executePreview"
                    class="iwd-preview-list">
                </div>

                <div class="iwd-modal-actions">

                    <button
                        class="iwd-btn-secondary"
                        onclick="closeExecuteModal()">

                        Hủy

                    </button>

                   <button 
                   id="executeSubmitBtn" 
                   class="iwd-btn-primary" 
                   onclick="submitExecute()">

                        Hoàn thành

                    </button>

                </div>

            </div>

        </div>
    `;
}

let executingItemId = null;
let isSubmitting = false;

function openExecuteModal(itemId) {

    executingItemId = itemId;

    document.getElementById('executeModal')
        .style.display = 'flex';
}

function closeExecuteModal() {

    executingItemId = null;

    document.getElementById('executeModal')
        .style.display = 'none';
}

async function submitExecute() {

    if (isSubmitting) {
        return;
    }

    try {

        isSubmitting = true;

        const submitBtn =
            document.getElementById(
                'executeSubmitBtn'
            );

        submitBtn.disabled = true;

        submitBtn.innerText =
            'Đang xử lý...';

        const note =
            document.getElementById(
                'executeNote'
            ).value;

        const fileInput =
            document.getElementById(
                'executeFiles'
            );

        if (!fileInput.files.length) {

            alert('Vui lòng chọn ảnh');

            resetSubmitState();

            return;
        }

        // upload files
        const uploadedFiles = [];

        for (const file of fileInput.files) {

            const formData = new FormData();

            formData.append('file', file);

            formData.append(
                'attachment_type',
                'supporting_image'
            );

            const uploadRes = await fetch(
                '/api/files/upload?module_name=incident',
                {
                    method: 'POST',
                    body: formData
                }
            );

            const uploadJson =
                await uploadRes.json();

            if (!uploadJson.success) {
                throw new Error(
                    uploadJson.message
                    || 'Upload failed'
                );
            }

            uploadedFiles.push(
                uploadJson.data.file_id
            );
        }

        // complete
        const res = await fetch(
            `/user/incident-work/checklist/${executingItemId}/complete`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    note,
                    files: uploadedFiles
                })
            }
        );

        const json = await res.json();

        if (!json.success) {
            throw new Error(json.message);
        }

        // optimistic UI
        await loadDetail();

        closeExecuteModal();

        showToast(
            'Checklist hoàn thành'
        );

    } catch (e) {

        alert(
            e.message || 'Execute failed'
        );

    } finally {

        resetSubmitState();
    }
}

function resetSubmitState() {

    isSubmitting = false;

    const submitBtn =
        document.getElementById(
            'executeSubmitBtn'
        );

    if (!submitBtn) {
        return;
    }

    submitBtn.disabled = false;

    submitBtn.innerText =
        'Hoàn thành';
}

function previewExecuteImages(e) {

    const container =
        document.getElementById(
            'executePreview'
        );

    container.innerHTML = '';

    const files = e.target.files;

    for (const file of files) {

        const url =
            URL.createObjectURL(file);

        container.innerHTML += `
            <img
                src="${url}"
                class="iwd-preview-image">
        `;
    }
}

function showToast(message) {

    const toast =
        document.createElement('div');

    toast.className = 'iwd-toast';

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {

        toast.classList.remove('show');

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2500);
}

function formatDate(date) {

    if (!date) return '-';

    return new Date(date)
        .toLocaleDateString('vi-VN');
}

function formatDateTime(date) {

    if (!date) return '-';

    return new Date(date)
        .toLocaleString('vi-VN');
}
function getIncidentId() {

    const paths =
        window.location.pathname.split('/');

    return paths[paths.length - 1];
}


loadDetail();