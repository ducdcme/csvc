document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('btnLogin')

    btn.onclick = async () => {

        try {

            const username = document.getElementById('username').value.trim()
            const password = document.getElementById('password').value.trim()

            if (!username || !password) {
                throw new Error('Nhập đầy đủ thông tin')
            }

            const res = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password
                })
            })

            const user = res.data

            // 🔥 ROLE-BASED REDIRECT
            if (user.roles?.includes('system_admin')) {
                window.location.href = '/manager/dashboard'
            }
            else if (
                user.roles?.includes('technical') ||
                user.roles?.includes('supervisor')
            ) {
                window.location.href = '/tech/dashboard'
            }
            else {
                window.location.href = '/guest/repair'
            }

        } catch (err) {
            showError(err.message)
        }
    }

    // enter submit
    document.getElementById('password').addEventListener('keydown', e => {
        if (e.key === 'Enter') btn.click()
    })
    const togglePass = document.getElementById("togglePass");
    // 👁️ Toggle password
    togglePass.addEventListener("click", () => {
        password.type = password.type === "password" ? "text" : "password";
        togglePass.textContent = password.type === "password" ? "👁️" : "🔒";
    })
})