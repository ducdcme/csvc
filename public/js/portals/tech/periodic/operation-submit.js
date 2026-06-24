let selectedFiles = [];
let previewUrls = [];

/* ================= JOB ================= */
function getJobIdFromUrl() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 2];
}

async function loadJobInfo() {

    const jobId = getJobIdFromUrl();

    const res = await api(`/user/periodic-work/jobs/${jobId}`);
    const job = res.data;

    document.getElementById('jobTitle').innerText = job.title;
    document.getElementById('jobTypeName').innerText = job.type_name;
    document.getElementById('jobDue').innerText = formatDate(job.due_date);

    // 🚨 FIX QUAN TRỌNG
    if (job.status === 'done') {

        const btn = document.getElementById('submitBtn');

        btn.disabled = true;
        btn.innerText = 'Đã hoàn thành';
        btn.dataset.done = 'true';

        showError('Công việc này đã hoàn thành');

        return;
    }
}

/* ================= IMAGE ================= */
function triggerFile() {
    document.getElementById('files').click();
}

function handleFiles(e) {
    Array.from(e.target.files).forEach(f => {
        selectedFiles.push(f);
        previewUrls.push(URL.createObjectURL(f));
    });
    renderPreview();
}

function renderPreview() {
    const el = document.getElementById('preview');
    el.innerHTML = '';

    previewUrls.forEach((url, i) => {
        const wrap = document.createElement('div');
        wrap.className = 'preview-item';

        const img = document.createElement('img');
        img.src = url;
        img.onclick = () => openPreview(url);

        const remove = document.createElement('div');
        remove.className = 'remove-btn';
        remove.innerText = '×';
        remove.onclick = (e) => {
            e.stopPropagation();
            removeFile(i);
        };

        wrap.appendChild(img);
        wrap.appendChild(remove);
        el.appendChild(wrap);
    });
}

function removeFile(i) {
    URL.revokeObjectURL(previewUrls[i]);
    previewUrls.splice(i, 1);
    selectedFiles.splice(i, 1);
    renderPreview();
}

function openPreview(url) {
    document.getElementById('imgPreviewLarge').src = url;
    document.getElementById('imgModal').style.display = 'flex';
}

function closePreview() {
    document.getElementById('imgModal').style.display = 'none';
}

/* ================= UPLOAD ================= */
async function uploadFiles() {
    if (!selectedFiles.length) return [];

    const uploads = selectedFiles.map(f => {
        const fd = new FormData();
        fd.append('file', f);

        return api('/api/files/upload?module_name=periodic', {
            method: 'POST',
            body: fd
        }).then(r => r.data.file_id);
    });

    return await Promise.all(uploads);
}

/* ================= NOTE ================= */
function toggleNote() {
    const el = document.getElementById('noteWrap');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

/* ================= SUBMIT ================= */
async function submitOperation() {

    const jobId = getJobIdFromUrl();
    const btn = document.getElementById('submitBtn');

    if (btn.dataset.done === 'true') return;

    try {

        btn.disabled = true;
        btn.innerText = 'Đang gửi...';

        const note = document.getElementById('note').value.trim();
        const noFile = document.getElementById('noFile').checked;

        let imgIds = [];
        if (!noFile) {
            imgIds = await uploadFiles();
        }

        if (!noFile && imgIds.length === 0) {
            throw new Error('Vui lòng chọn ảnh thực hiện công tác');
        }

        const res = await api(`/user/periodic-work/jobs/${jobId}/submit-operation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note,
                attachments: imgIds.map(id => ({ file_id: id })),
                no_file: noFile
            })
        });

        if (res.success) {

            showSuccess('Hoàn thành');

            btn.dataset.done = 'true';
            btn.disabled = true;
            btn.innerText = 'Đã hoàn thành';

            setTimeout(() => {
                window.location.href = '/tech/periodic-work';
            }, 1000);
        }

    } catch (err) {
        showError(err.message);

        if (btn.dataset.done !== 'true') {
            btn.disabled = false;
            btn.innerText = 'Hoàn thành';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadJobInfo);