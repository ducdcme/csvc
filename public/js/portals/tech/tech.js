
async function checkAuth() {

    try {

        await api('/api/auth/me')

    } catch (err) {

        window.location.href = '/guest/campus'
    }
}
// ===== LOAD CURRENT USER =====
async function loadCurrentUser() {
    try {
        const res = await fetch('/api/auth/me')
        const json = await res.json()

        if (!json.success) {
            window.location.href = '/guest/login'
            return
        }

        const { user, roles } = json.data
        document.getElementById('currentUser').textContent = user.username
        document.getElementById('userFullName').textContent = user.full_name
        document.getElementById('userRole').textContent = roles.join(', ')
        const menu = document.getElementById('userMenu');
        if (roles.includes('system_admin')) {

            menu.insertAdjacentHTML('beforeend', `
        <div class="menu-divider">
        </div>
        <div class="menu-item"
             onclick="location.href='/manager/dashboard'">
             🛠 Manager Dashboard
        </div>  

        </div>
    `);
        }

    } catch (e) {
        console.error(e)
    }
}

// ===== LOGOUT =====
async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/guest/campus'
}

// bind
document.addEventListener('DOMContentLoaded', () => {

    loadCurrentUser()

    const logoutBtn = document.getElementById('btnLogout')
    if (logoutBtn) logoutBtn.addEventListener('click', logout)

})

