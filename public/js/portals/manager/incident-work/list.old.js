async function load() {
    const res = await fetch('/user/incident-work');
    const json = await res.json();

    const container = document.getElementById('list');
    container.innerHTML = '';
    const internal = json.data.internal;
    const external = json.data.external;
    const closed = json.data.recent_closed;

    internal.forEach(i => {
        const el = document.createElement('div');

        el.innerHTML = `
      <b>#${i.id}</b> | ${i.title} | ${i.status}
      <button onclick="go(${i.id})">Detail</button>
    `;

        container.appendChild(el);
    });
    external.forEach(i => {
        const el = document.createElement('div');

        el.innerHTML = `
      <b>#${i.id}</b> | ${i.title} | ${i.status}
      <button onclick="go(${i.id})">Detail</button>
    `;

        container.appendChild(el);
    });
    closed.forEach(i => {
        const el = document.createElement('div');

        el.innerHTML = `
      <b>#${i.id}</b> | ${i.title} | ${i.status}
      <button onclick="go(${i.id})">Detail</button>
    `;

        container.appendChild(el);
    });
}

function go(id) {
    window.location.href = `/manager/incident-work/${id}`;
}

load();