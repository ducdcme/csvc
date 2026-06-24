let contractors = [];
let deleteId = null;

const modal =document.getElementById('contractor-delete-modal');

const btnConfirm =document.getElementById('contractor-modal-confirm');

const btnCancel =document.getElementById('contractor-modal-cancel');


async function load() {


const res = await fetch('/user/contractors');

const json = await res.json();

if (!json.success) {
    alert(json.message);
    return;
}

contractors = json.data || [];

document.getElementById(
    'contractor-total'
).innerText =
    contractors.length;

render(contractors);


}

function render(data) {


const tbody =document.getElementById('contractor-body');

tbody.innerHTML = '';

if (data.length === 0) {

    tbody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="contractor-empty">

                No contractor found

            </td>
        </tr>
    `;

    return;
}

data.forEach((i, index) => {

    const tr =document.createElement('tr');

    tr.innerHTML = `
        <td>
            ${index + 1}
        </td>

        <td>
            ${i.name || ''}
        </td>

        <td>
            ${i.contact || ''}
            ${i.contact2
                ? `<br>${i.contact2}`
                : ''}
        </td>

        <td>
            ${i.phone || ''}
            ${i.phone2
                ? `<br>${i.phone2}`
                : ''}
        </td>

        <td>

            <span
                class="
                contractor-badge
                ${i.type === 'INTERNAL'
                    ? 'internal'
                    : 'external'}
            ">

                ${i.type}

            </span>

        </td>

        <td>

            <div
                class="contractor-action">

                <a
                    class="contractor-btn-edit"
                    href="/manager/contractors/edit/${i.id}">

                    Edit

                </a>

                <a
                    href="#"
                    class="contractor-btn-delete"
                    onclick="
                        removeContractor(${i.id});
                        return false;
                    ">

                    Delete

                </a>

            </div>

        </td>
    `;

    tbody.appendChild(tr);
});


}

document.getElementById('contractor-search').addEventListener('keyup',function () {


        const keyword =
            this.value
                .toLowerCase()
                .trim();

        const filtered =
            contractors.filter(i =>
                (i.name || '')
                    .toLowerCase()
                    .includes(keyword)
            );

        render(filtered);
    }
);


async function removeContractor(id) {


if (
    !confirm(
        'Delete this contractor?'
    )
) {
    return;
}

const res =
    await fetch(
        `/user/contractors/${id}`,
        {
            method: 'DELETE'
        }
    );

const json =
    await res.json();

if (!json.success) {

    alert(json.message);

    return;
}

load();


}

load();
