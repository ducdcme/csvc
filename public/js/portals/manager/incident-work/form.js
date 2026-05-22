// Handle create incident

document.getElementById('incident-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        work_type: document.getElementById('work_type').value,
        start_date: document.getElementById('start_date').value, // 👈 thêm dòng này
        due_date: document.getElementById('due_date').value
    };

    console.log('Submitting:', data);

    try {
        const res = await fetch('/user/incident-work', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        console.log('Response:', json);

        if (!json.success) {
            document.getElementById('result').innerHTML =
                `<span style="color:red">${json.message}</span>`;
            return;
        }

        document.getElementById('result').innerHTML =
            `<span style="color:green">Created ID: ${json.data.id}</span>`;
        setTimeout(() => {
            window.location.href = '/manager/incident-work/create';
        }, 1000);
    } catch (err) {
        console.error(err);
    }
});