async function create() {
    const data = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        contact: document.getElementById('contact').value,
        phone: document.getElementById('phone').value,
        type: document.getElementById('type').value
    };

    console.log('Create contractor:', data);

    const res = await fetch('/user/contractors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const json = await res.json();

    console.log('Response:', json);

    if (!json.success) {
        alert(json.message);
        return;
    }

    alert('Created');

    window.location.href = '/manager/contractors';
}