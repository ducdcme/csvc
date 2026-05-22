async function checkAuth() {

    try {

        await api('/api/auth/me')

    } catch (err) {

        window.location.href = '/guest/campus'
    }
}
// ===== render CURRENT USER =====
async function renderCurrentUser() {
    try {
        const res = await fetch('/api/auth/me')
        const json = await res.json()

        if (!json.success) {
            window.location.href = '/guest/login'
            return
        }
        window.APP_CURRENT_USER = json.data.user;
        window.USER_PERMISSIONS = json.data.permissions || [];
        const { user, roles } = json.data
        document.getElementById('currentUser').textContent = user.username
        document.getElementById('userFullName').textContent = user.full_name
        document.getElementById('userRole').textContent = roles.join(', ')
        const menu = document.getElementById('userMenu');
        if (roles.includes('system_admin')) {

            menu.insertAdjacentHTML('beforeend', `
        <div class="menu-divider"></div>

        <div class="menu-item"
             onclick="location.href='/tech/dashboard'">
             🛠 Tech Dashboard
        </div>

        <div class="menu-item"
             onclick="location.href='/supervisor/dashboard'">
             👨‍💼 Supervisor Dashboard
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
/*
|--------------------------------------------------------------------------
| GLOBAL STATE
|--------------------------------------------------------------------------
*/

window.currentCampus = null

window.campuses = []



/*
|--------------------------------------------------------------------------
| LOAD CAMPUSES
|--------------------------------------------------------------------------
*/

async function loadCampuses() {

    try {

        const response = await fetch(
            '/api/campus'
        )



        const result =
            await response.json()



        if (!result.success) {

            console.error(
                'Cannot load campuses'
            )

            return []

        }



        window.campuses =
            result.data || []



        return window.campuses

    } catch (err) {

        console.error(err)

        return []

    }

}



/*
|--------------------------------------------------------------------------
| LOAD CURRENT CAMPUS
|--------------------------------------------------------------------------
*/

async function loadCurrentCampus() {

    try {

        const response = await fetch(
            '/api/campus/current'
        )



        const result =
            await response.json()



        if (!result.success) {

            console.error(
                'Cannot load current campus'
            )

            return null

        }



        window.currentCampus =
            result.data || null



        return window.currentCampus

    } catch (err) {

        console.error(err)

        return null

    }

}



/*
|--------------------------------------------------------------------------
| RENDER CAMPUS SWITCHER
|--------------------------------------------------------------------------
*/

function renderCampusSwitcher() {

    /*
    |--------------------------------------------------------------------------
    | ELEMENTS
    |--------------------------------------------------------------------------
    */

    const wrapper = document.getElementById('campus-switcher')




    /*
    |--------------------------------------------------------------------------
    | HIDE IF ONLY 1
    |--------------------------------------------------------------------------
    */

    if (
        window.campuses.length <= 1
    ) {

        wrapper.style.display = 'none'

        return

    }



    wrapper.style.display = 'flex'



    /*
    |--------------------------------------------------------------------------
    | OPTIONS
    |--------------------------------------------------------------------------
    */

    wrapper.innerHTML = '<div class="menu-group"><div class="menu-item" onclick="toggleSubMenu(99)"><div class="menu_left"><div class="menu-icon">📊</div></div><div class="menu-text">Chuyển cơ sở</div></div><div class="submenu" id="submenu-99">'

        + window.campuses.map(item => `
            
            <div class="submenu-item" onclick="switchCampus('${item.id}','${item.name}')">
                <span class="submenu-dot" ></span>
                <span class="submenu-text" value="${item.id}">
                    ${item.name}
                </span>
            </div>
        `).join('') + "</div></div>"

}



/*
|--------------------------------------------------------------------------
| SWITCH CAMPUS
|--------------------------------------------------------------------------
*/

async function switchCampus(campusId, campusName) {
    try {
        const response = await fetch('/api/campus/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                campus_id: campusId
            })
        }
        )



        const result =
            await response.json()



        if (!result.success) {

            showError(result.message)

            return

        }
        localStorage.setItem('campus_name', campusName)

        showSuccess(
            'Campus switched'
        )



        /*
        |--------------------------------------------------------------------------
        | RELOAD
        |--------------------------------------------------------------------------
        */

        window.location.reload()

    } catch (err) {

        console.error(err)

        showError(
            'Cannot switch campus'
        )

    }

}



/*
|--------------------------------------------------------------------------
| INIT CAMPUS SYSTEM
|--------------------------------------------------------------------------
*/

async function initCampusSystem() {

    await loadCampuses()

    await loadCurrentCampus()

    renderCampusSwitcher()

}
// bind
document.addEventListener('DOMContentLoaded', () => {

    renderCurrentUser()
    initCampusSystem()
    const logoutBtn = document.getElementById('btnLogout')
    if (logoutBtn) logoutBtn.addEventListener('click', logout)

})

