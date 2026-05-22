// public/js/portals/manager/menuManager.js

const menu = [
    {
        label: 'Tổng quan',
        icon: '📊',
        path: '/manager/dashboard'
    },

    {
        label: 'Master Data',
        icon: '🗂️',
        children: [
            {
                label: 'Building',
                path: '/manager/master-data/buildings'
            },
            {
                label: 'Floor',
                path: '/manager/master-data/floors'
            },
            {
                label: 'Room',
                path: '/manager/master-data/rooms'
            },
            {
                label: 'Room Type',
                path: '/manager/master-data/room-types'
            },
            {
                label: 'Asset Type',
                path: '/manager/master-data/asset-types'
            },
            {
                label: 'Room Assets',
                path: '/manager/master-data/room-type-assets'
            },
            {
                label: 'Room Names',
                path: '/manager/master-data/room-names'
            }
        ]
    },

    {
        label: 'Quản lý người dùng',
        icon: '🛡️',
        children: [
            {
                label: 'Users',
                path: '/manager/users'
            },
            {
                label: 'Roles',
                path: '/manager/roles'
            },
            {
                label: 'Permissions',
                path: '/manager/permissions'
            }
        ]
    },
    {
        label: 'Quản lý việc định kỳ',
        icon: '📋',
        children: [
            {
                label: 'Định nghĩa công việc',
                path: '/manager/periodic-work/definitions'
            },
            {
                label: 'Danh sách công việc',
                path: '/manager/periodic-work/jobs'
            },
            {
                label: 'Tạo mới công việc',
                path: '/manager/periodic-work/generate'
            }
        ]
    },
    {
        label: 'Quản lý việc phát sinh',
        icon: '📋',
        children: [
            {
                label: 'Danh sách công việc',
                path: '/manager/incident-work'
            },
            {
                label: 'Tạo mới công việc',
                path: '/manager/incident-work/create'
            }
        ]
    },

    {
        label: 'Import',
        icon: '📥',
        children: [

            {
                label: 'Import Building/Floor/Room',
                path: '/manager/import/locations'
            },
            {
                label: 'Import Room Name by Year',
                path: '/manager/import/room-names'
            }
        ]
    },
    {
        label: 'Files Manager',
        icon: '📂',
        children: [

            {
                label: 'Rotate Image',
                path: '/manager/files'
            }
        ]
    }
]


document.addEventListener('DOMContentLoaded', () => {

    const menuContainer = document.getElementById('menuContainer')

    const logoText = document.getElementById('logo-text')

    logoText.textContent = 'ADMIN PORTAL'

    const currentPath = window.location.pathname


    menuContainer.innerHTML = menu.map((item, index) => {

        const hasChildren = item.children && item.children.length > 0

        const isActiveParent = hasChildren
            ? item.children.some(child => currentPath.startsWith(child.path))
            : currentPath.startsWith(item.path)

        return `
            <div class="menu-group">

                <div
                    class="menu-item ${isActiveParent ? 'active' : ''}"
                    ${hasChildren
                ? `onclick="toggleSubMenu(${index})"`
                : `onclick="location.href='${item.path}'"`
            }
                >

                    <div class="menu-left">

                        <span class="menu-icon">
                            ${item.icon}
                        </span>

                        <span class="menu-text">
                            ${item.label}
                        </span>

                    </div>

                    ${hasChildren
                ? `
                            <span
                                class="menu-arrow"
                                id="menu-arrow-${index}"
                            >
                                ▾
                            </span>
                        `
                : ''
            }

                </div>

                ${hasChildren
                ? `
                        <div
                            class="submenu ${isActiveParent ? 'open' : ''}"
                            id="submenu-${index}"
                        >

                            ${item.children.map(child => `

                                <div
                                    class="
                                        submenu-item
                                        ${currentPath === child.path ? 'active' : ''}
                                    "
                                    onclick="location.href='${child.path}'"
                                >

                                    <span class="submenu-dot"></span>

                                    <span class="submenu-text">
                                        ${child.label}
                                    </span>

                                </div>

                            `).join('')}

                        </div>
                    `
                : ''
            }

            </div>
        `

    }).join('')

})



function toggleSubMenu(index) {

    const submenu = document.getElementById(`submenu-${index}`)

    const arrow = document.getElementById(`menu-arrow-${index}`)

    if (!submenu) {
        return
    }

    submenu.classList.toggle('open')

    arrow.classList.toggle('rotate')

}