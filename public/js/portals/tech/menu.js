//js/portals/tech/menu.js
const menu = [
    { label: 'Tổng quan', icon: '📊', path: '/tech/dashboard' },
    { label: 'Báo hỏng & sửa chữa', icon: '🔧', path: '/tech/repairs' },
    { label: 'Ngăn ngừa rủi ro', icon: '🛡️', path: '/tech/inspection' },
    { label: 'Vận hành định kỳ', icon: '🔁', path: '/tech/periodic-work' },
    { label: 'Công việc phát sinh', icon: '📋', path: '/tech/incident-work' },
    { label: 'Công việc hè', icon: '☀️', path: '/tech/summer-work' }
]

document.addEventListener('DOMContentLoaded', () => {

    const el = document.getElementById('menuContainer')

    el.innerHTML = menu.map(item => `
        <div class="menu-item" onclick="location.href='${item.path}'">
            <span class="menu-icon">${item.icon}</span>
            <span class="menu-text">${item.label}</span>
        </div>
    `).join('')

})