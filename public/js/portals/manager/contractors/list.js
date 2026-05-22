async function load() {
    const res = await fetch('/user/contractors');
    const json = await res.json();

    const c = document.getElementById('list');
    c.innerHTML = '';

    json.data.forEach(i => {
        const el = document.createElement('div');
        el.innerText = `${i.id} - ${i.name}`;
        c.appendChild(el);
    });
}

load();