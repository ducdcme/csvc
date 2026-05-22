function mapStatus(s) {
    return {
        cho_tiep_nhan: 'Chờ xử lý',
        da_tiep_nhan: 'Đang xử lý',
        dang_xu_ly: 'Đang xử lý',
        hoan_thanh: 'Hoàn thành'
    }[s] || s
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
function mapText(s) {
    if (s === 'cho_tiep_nhan') return 'Chờ xử lý'
    if (['da_tiep_nhan', 'dang_xu_ly'].includes(s)) return 'Đang xử lý'
    if (s === 'hoan_thanh') return 'Hoàn thành'

}

function mapClass(s) {
    if (s === 'cho_tiep_nhan') return 'pending'
    if (s === 'da_tiep_nhan') return 'received'
    if (s === 'dang_xu_ly') return 'fixing'
    if (s === 'hoan_thanh') return 'done'
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit'
    })
}
function formatTime(t) {
    if (!t) return '—'
    const d = new Date(t)
    return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    })
}
function formatDateTime(d) {

    const date = new Date(d)

    const time = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    })

    const day = date.toLocaleDateString('vi-VN')

    return `${day} ${time}`
}
function showToast(msg) {
    const t = document.getElementById('toast')
    if (!t) return

    t.textContent = msg
    t.classList.add('show')

    setTimeout(() => t.classList.remove('show'), 2000)
}
/**
 * =========================
 * SHOW SUCCESS
 * =========================
 */
function showSuccess(message) {

    const div = document.createElement('div');
    div.innerText = message;

    div.style.position = 'fixed';
    div.style.bottom = '80px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.background = '#4caf50';
    div.style.color = '#fff';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '6px';
    div.style.zIndex = '9999';

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 2000);
}


/**
 * =========================
 * SHOW ERROR
 * =========================
 */
function showError(message) {

    const div = document.createElement('div');
    div.innerText = message;

    div.style.position = 'fixed';
    div.style.bottom = '80px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.background = '#f44336';
    div.style.color = '#fff';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '6px';
    div.style.zIndex = '9999';

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}
function getCurrentAcademicYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month >= 9) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}
function openImageViewer(fileId) {
    const img = document.getElementById('viewerImg')
    img.src = `/api/files/${fileId}`
    document.getElementById('imageViewer').classList.add('show')
}

function closeImageViewer() {
    document.getElementById('imageViewer').classList.remove('show')
}

/**
 * =========================
 * CUSTOM CONFIRM MODAL
 * =========================
 */
function confirmModal({
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = false
} = {}) {
    return new Promise((resolve) => {

        const existing = document.getElementById('app-confirm-modal');

        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');

        modal.id = 'app-confirm-modal';

        modal.innerHTML = `
            <div class="app-confirm-overlay">

                <div class="app-confirm-box">

                    <div class="app-confirm-title">
                        ${title}
                    </div>

                    <div class="app-confirm-message">
                        ${message}
                    </div>

                    <div class="app-confirm-actions">

                        <button
                            type="button"
                            class="app-confirm-btn app-confirm-cancel"
                            id="app-confirm-cancel"
                        >
                            ${cancelText}
                        </button>

                        <button
                            type="button"
                            class="app-confirm-btn ${danger
                ? 'app-confirm-danger'
                : 'app-confirm-primary'}"
                            id="app-confirm-ok"
                        >
                            ${confirmText}
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById('app-confirm-cancel')
            .addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });

        document
            .getElementById('app-confirm-ok')
            .addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });

        modal
            .querySelector('.app-confirm-overlay')
            .addEventListener('click', (event) => {
                if (event.target.classList.contains('app-confirm-overlay')) {
                    modal.remove();
                    resolve(false);
                }
            });
    });
}

function hasPermission(permissionCode) {
    if (!window.USER_PERMISSIONS) {
        return false;
    }

    return window.USER_PERMISSIONS.includes(permissionCode);
}