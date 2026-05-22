// Change Password JS

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btnChangePw');

    btn.addEventListener('click', handleChangePassword);
});

async function handleChangePassword() {
    const old_password = document.getElementById('old_password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    const messageEl = document.getElementById('message');

    // Reset message
    messageEl.className = 'message';
    messageEl.innerText = '';

    // Validate FE
    if (!old_password || !new_password || !confirm_password) {
        return showError("All fields are required");
    }

    if (new_password !== confirm_password) {
        return showError("Password confirmation does not match");
    }

    try {
        const res = await fetch('/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                old_password,
                new_password,
                confirm_password
            })
        });

        const json = await res.json();

        if (!json.success) {
            return showError(json.message);
        }

        showSuccess("Password changed! Logging out...");

        // 🔁 AUTO LOGOUT
        setTimeout(async () => {
            await fetch('/api/auth/logout', { method: 'POST' });

            window.location.href = '/guest/login';
        }, 1500);

    } catch (err) {
        console.error(err);
        showError("Something went wrong");
    }
}

// Helpers
function showError(msg) {
    const el = document.getElementById('message');
    el.className = 'message error';
    el.innerText = msg;
}

function showSuccess(msg) {
    const el = document.getElementById('message');
    el.className = 'message success';
    el.innerText = msg;
}
function togglePassword(id) {
    const input = document.getElementById(id);
    const eye = document.getElementById(id).nextElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    eye.textContent = input.type === 'password' ? '👁️' : '🔒';
}
function resetMessage() {
    const el = document.getElementById('message');
    el.className = 'message';
    el.innerText = '';
}