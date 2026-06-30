let selectedFiles = [];
let previewUrls = [];

let resultFiles = [];
let resultUrls = [];
let readonly = false;
/* ================= JOB ================= */
function getJobIdFromUrl() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 2];
}

let requiresResultFile = false;

async function loadJobInfo() {

    const jobId = getJobIdFromUrl();

    const res = await api(`/user/periodic-work/jobs/${jobId}`);
    const job = res.data;

    document.getElementById('jobTitle').innerText = job.title;
    document.getElementById('jobTypeName').innerText = job.type_name;
    document.getElementById('jobDue').innerText = formatDate(job.due_date);

    requiresResultFile = job.requires_result_file;

    if (!requiresResultFile) {
        document.getElementById('fileResult').style.display = 'none';
    }

    if (requiresResultFile) {

        document.getElementById('fileResult').style.display = 'block';

        document.querySelector('#resultPreview')
            .insertAdjacentHTML(
                'beforebegin',
                `<div style="color:red;font-size:13px">
                    * Bắt buộc upload tài liệu bảo trì
                 </div>`
            );
    }

    // ===== VIEW MODE =====
    if (job.status === 'done') {

        readonly = true;

        document.getElementById('jobStatusBadge').style.display = '';

        document.getElementById('submitBtn').style.display = 'none';

        document.querySelector('.upload-box').parentElement.style.display = 'none';

        document.getElementById('fileResult').style.display = 'none';

        document.getElementById('viewSection').style.display = '';

        document.getElementById('noteWrap').style.display = 'block';
        document.getElementById('noteBtn').style.display = 'none';

        document.getElementById('note').value = job.note || '';
        document.getElementById('note').disabled = true;

        renderReadonlyFiles(job);

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

/* ================= RESULT FILE ================= */
function triggerResultFile() {
    document.getElementById('resultFiles').click();
}

function handleResultFiles(e) {
    Array.from(e.target.files).forEach(f => {
        resultFiles.push(f);
        resultUrls.push(URL.createObjectURL(f));
    });
    renderResult();
}

function renderResult() {
    const el = document.getElementById('resultPreview');
    el.innerHTML = '';

    resultFiles.forEach((f, i) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerText = f.name;

        const remove = document.createElement('div');
        remove.className = 'remove-btn';
        remove.innerText = '×';
        remove.onclick = (e) => {
            e.stopPropagation();
            removeResult(i);
        };

        div.appendChild(remove);
        el.appendChild(div);
    });
}

function removeResult(i) {
    resultFiles.splice(i, 1);
    resultUrls.splice(i, 1);
    renderResult();
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

async function uploadResultFiles() {
    if (!resultFiles.length) return [];

    const uploads = resultFiles.map(f => {
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
async function submitMaintenance() {

    const jobId = getJobIdFromUrl();
    const btn = document.getElementById('submitBtn');

    // 🚨 nếu đã submit thành công thì chặn luôn
    if (btn.dataset.done === 'true') {
        showError('Công việc đã hoàn thành');
        return;
    }
    try {

        btn.disabled = true;
        btn.innerText = 'Đang gửi...';

        const note = document.getElementById('note').value.trim();
        const noFile = document.getElementById('noFile').checked;

        // ===== ẢNH =====
        let imgIds = [];
        if (!noFile) {
            imgIds = await uploadFiles();
        }

        if (!noFile && imgIds.length === 0) {
            throw new Error('Vui lòng gửi báo cáo hình ảnh');
        }

        // ===== FILE KẾT QUẢ =====
        const resultIds = await uploadResultFiles();

        // ===== FE VALIDATE (nếu có require) =====
        if (typeof requiresResultFile !== 'undefined' && requiresResultFile && resultIds.length === 0) {
            throw new Error('Công việc này yêu cầu file kết quả');
        }

        // ===== CALL API =====
        const res = await api(`/user/periodic-work/jobs/${jobId}/submit-maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note,
                attachments: imgIds.map(id => ({ file_id: id })),
                result_files: resultIds.map(id => ({ file_id: id })),
                no_file: noFile
            })
        });

        // ===== SUCCESS =====
        if (res.success) {

            showSuccess('Hoàn thành');

            // 🔥 khóa luôn nút (không cho submit lại)
            btn.dataset.done = 'true';
            btn.disabled = true;
            btn.innerText = 'Đã hoàn thành';

            setTimeout(() => {
                window.location.href = '/tech/periodic-work';
            }, 1000);
        }

    } catch (err) {

        showError(err.message);

        // ❗ chỉ mở lại nút nếu CHƯA thành công
        if (btn.dataset.done !== 'true') {
            btn.disabled = false;
            btn.innerText = 'Hoàn thành';
        }

    }
}
function renderReadonlyFiles(job) {

    const attachmentWrap =document.getElementById('viewAttachments');

    const resultWrap =document.getElementById('viewResultFiles');

    const resultSection =document.getElementById('resultFileSection');

    const attachmentSection =document.getElementById('attachmentSection');

    const noteSection =document.getElementById('noteSection');

    // Ẩn luôn section ghi chú nếu không có ghi chú
    if (!job.note || job.note.trim() === '') {
        noteSection.style.display = 'none';
    }

    attachmentWrap.innerHTML = '';
    resultWrap.innerHTML = '';

     // ===== ẢNH HIỆN TRƯỜNG =====
    (job.attachments || []).forEach(file => {

        const isImage =
            file.mime_type &&
            file.mime_type.startsWith('image/');

        if (isImage) {

            const img = document.createElement('img');

            img.src = `/api/files/${file.file_id}`;
            img.className = 'thumb';

            img.onclick = () =>openPreview(img.src);
            

            attachmentWrap.appendChild(img);

        } else {

            const a = document.createElement('a');

            a.href = `/api/files/${file.file_id}`;
            a.target = '_blank';
            a.className = 'file-link';
            a.innerText =
                file.original_filename ||
                `File #${file.file_id}`;

            attachmentWrap.appendChild(a);
        }
    });

    // ===== FILE KẾT QUẢ =====
    if (!job.result_files ||
        job.result_files.length === 0) {

        resultSection.style.display = 'none';
        return;
    }

    resultSection.style.display = '';

    job.result_files.forEach(file => {

        const a = document.createElement('a');

        a.href = `/api/files/${file.file_id}`;
        a.target = '_blank';

        a.className = 'file-link';

        a.innerText =
            file.original_filename ||
            `File #${file.file_id}`;

        resultWrap.appendChild(a);
    });
}
document.addEventListener('DOMContentLoaded', loadJobInfo);