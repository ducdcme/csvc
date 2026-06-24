const contractorId =
window.location.pathname.includes('/edit/')
? window.location.pathname.split('/').pop()
: null;

async function loadDetail() {

if (!contractorId) {

    document.getElementById('page-title').innerText ='Create Contractor';

    return;
}

document.getElementById('page-title').innerText ='Edit Contractor';

const res = await fetch(
    `/user/contractors/${contractorId}`
);

const json = await res.json();

if (!json.success) {
    showError(json.message);
    return;
}

const d = json.data;

document.getElementById('id').value =d.id || '';

document.getElementById('name').value =d.name || '';

document.getElementById('address').value =d.address || '';

document.getElementById('contact').value =d.contact || '';

document.getElementById('phone').value =d.phone || '';

document.getElementById('contact2').value =d.contact2 || '';

document.getElementById('phone2').value =d.phone2 || '';

document.getElementById('type').value =d.type || 'EXTERNAL';


}

async function save() {

const data = {

    name:document.getElementById('name').value.trim(),

    address:document.getElementById('address').value.trim(),

    contact:document.getElementById('contact').value.trim(),

    phone:document.getElementById('phone').value.trim(),

    contact2:document.getElementById('contact2').value.trim(),

    phone2:document.getElementById('phone2').value.trim(),

    type:document.getElementById('type').value};

if (!data.name) {
    showError('Contractor name required');
    return;
}

if (!data.contact) {
    showError('Contact required');
    return;
}

if (!data.phone) {
    showError('Phone required');
    return;
}

if (
    data.contact2 &&
    !data.phone2
) {
    showError('Phone 2 required');
    return;
}

if (
    data.phone2 &&
    !data.contact2
) {
    showError('Contact 2 required');
    return;
}

let url = '/user/contractors';
let method = 'POST';

if (contractorId) {

    url =
        `/user/contractors/${contractorId}`;

    method = 'PUT';
}

const res = await fetch(
    url,
    {
        method,
        headers: {
            'Content-Type':
                'application/json'
        },
        body: JSON.stringify(data)
    }
);

const json = await res.json();

if (!json.success) {
    showError(json.message);
    return;
}

showSuccess(
    contractorId
        ? 'Updated'
        : 'Created'
);

window.location.href =
    '/manager/contractors';


}

loadDetail();
