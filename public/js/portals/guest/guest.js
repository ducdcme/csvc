document.addEventListener('DOMContentLoaded', () => {

    const campus = localStorage.getItem('campus_name')
    const el = document.getElementById('headerCampus')

    if (campus && el) {
        el.textContent = campus
    }
    loadportal()
})
document.addEventListener('DOMContentLoaded', () => {

    const el = document.getElementById('campusName')

    if (!el) return

    const campus = localStorage.getItem('campus_name')

    if (campus) {
        el.textContent = campus
    } else {
        el.textContent = 'Chưa chọn'
    }

})
function showToast(msg) {
    const t = document.getElementById('toast')
    if (!t) return

    t.textContent = msg
    t.classList.add('show')

    setTimeout(() => t.classList.remove('show'), 2000)
}
async function loadportal() {

    const res = await fetch('/api/auth/me')
    const json = await res.json()
    if (!json.success) {
        return;
    }
    if (json.data.user != '') {
        document.getElementById('currentUser').textContent = json.data.user.username
        window.location.href = '/tech/dashboard'
    }
    else {
        document.getElementById('currentUser').textContent = 'Đăng nhập'

    }
}