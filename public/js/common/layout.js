document.addEventListener('DOMContentLoaded', () => {

    const menuBtn = document.getElementById('menuBtn')
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')

    function toggleSidebar() {

        if (window.innerWidth < 900) {
            sidebar.classList.toggle('open')
            overlay.classList.toggle('show')
            menuBtn.textContent = sidebar.classList.contains('open') ? '✕' : '☰'
        } else {
            sidebar.classList.toggle('collapsed')
            menuBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✕'
        }
    }

    menuBtn.addEventListener('click', toggleSidebar)

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open')
        overlay.classList.remove('show')
        menuBtn.textContent = '☰'
    })
    document.addEventListener("click", (e) => {

        if (window.innerWidth < 900) {

            if (
                !sidebar.contains(e.target) &&
                !menuBtn.contains(e.target)
            ) {

                sidebar.classList.remove("open")
                overlay.classList.remove("show")
                menuBtn.textContent = "☰"

            }

        }

    })
})

