// Dark mode
const darkToggle = document.getElementById("darkToggle")

darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark")
    if (document.body.classList.contains("dark")) {
        darkToggle.textContent = "Light"
    } else {
        darkToggle.textContent = "Dark"
    }
})