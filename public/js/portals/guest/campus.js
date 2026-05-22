document.addEventListener('DOMContentLoaded', init)

async function init() {
    const list = document.getElementById('campusList')
    if (!list) return

    try {
        list.innerHTML = '<p>Đang tải...</p>'

        const res = await api('/api/campus')

        if (!res.success) {
            throw new Error(res.message)
        }

        renderCampus(list, res.data)

    } catch (err) {
        list.innerHTML = '<p>Lỗi tải campus</p>'
        console.error(err)
    }
}

function renderCampus(container, campuses) {
    container.innerHTML = ''
    const saved = localStorage.getItem('campus_name')
    campuses.forEach(campus => {
        const btn = document.createElement('button')

        // ✅ dùng class đúng UI mới
        btn.className = 'campus-item'
        btn.textContent = campus.name
        if (campus.name === saved) {
            btn.style.border = '2px solid #2563eb'
        }
        btn.onclick = () => selectCampus(btn, campus, container)

        container.appendChild(btn)
    })
}

async function selectCampus(btn, campus, container) {
    try {
        clearError();
        // 🔥 disable toàn bộ list (tránh click spam)
        const allBtns = container.querySelectorAll('button')
        allBtns.forEach(b => b.disabled = true)

        btn.innerText = 'Đang chọn...'

        const res = await api('/api/campus/select', {
            method: 'POST',
            body: JSON.stringify({
                campus_id: campus.id
            })
        })

        if (!res.success) {
            throw new Error(res.message)
        }

        // lưu local
        localStorage.setItem('campus_name', campus.name)

        // hiệu ứng chọn
        btn.innerText = '✔ Đã chọn'
        btn.style.background = '#16a34a'
        btn.style.color = '#fff'

        // delay nhẹ cho mượt UX
        setTimeout(() => {
            window.location.href = '/guest/repair'
        }, 400)

    } catch (err) {
        btn.disabled = false
        btn.innerText = campus.name
        showError(err.message || 'Không chọn được cơ sở')
    }
}
function showError(msg) {
    const el = document.getElementById('campusError');
    if (el) {
        el.innerText = msg;
    }
}

function clearError() {
    const el = document.getElementById('campusError');
    if (el) {
        el.innerText = '';
    }
}