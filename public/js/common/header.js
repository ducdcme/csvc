document.addEventListener('DOMContentLoaded', () => {

    const el = document.getElementById('campusName')

    if (!el) return

    const campus = localStorage.getItem('campus_name')

    if (campus) {
        el.textContent = campus
    } else {
        el.textContent = 'Chưa chọn'
    }
    initUserDropdown()

})
function initUserDropdown() {

    const trigger = document.getElementById('userTrigger')
    const menu = document.getElementById('userMenu')

    if (!trigger || !menu) return

    trigger.onclick = () => {
        menu.classList.toggle('show')
    }

    // click ngoài → đóng
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show')
        }
    })
}