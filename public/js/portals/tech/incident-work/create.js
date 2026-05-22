async function loadForm() {

    renderForm();
}

function renderForm() {

    document.getElementById(
        'iwcForm'
    ).innerHTML = `
        <div class="iwc-card">

            <div class="iwc-title">
                Tạo công việc phát sinh
            </div>

            <div class="iwc-group">

                <label>Tên công việc *</label>

                <input
                    id="title"
                    class="iwc-input">

            </div>

            <div class="iwc-group">

                <label>Mô tả</label>

                <textarea
                    id="description"
                    class="iwc-textarea">
                </textarea>

            </div>

            <div class="iwc-group">

                <label>Loại công việc</label>

                <select
                    id="workType"
                    class="iwc-input">

                    <option value="INTERNAL">
                        Nội bộ
                    </option>

                    <option value="EXTERNAL">
                        Thuê ngoài
                    </option>

                </select>

            </div>

            <div class="iwc-group">

                <label>Ngày bắt đầu</label>

                <input
                    id="startDate"
                    type="date"
                    class="iwc-input">

            </div>

            <div class="iwc-group">

                <label>Hạn hoàn thành *</label>

                <input
                    id="dueDate"
                    type="date"
                    class="iwc-input">

            </div>

            <button
                class="iwc-submit"
                onclick="submitCreate()">

                Tạo công việc

            </button>

        </div>
    `;
}

async function submitCreate() {

    try {

        const body = {

            title:
                document.getElementById(
                    'title'
                ).value,

            description:
                document.getElementById(
                    'description'
                ).value,

            work_type:
                document.getElementById(
                    'workType'
                ).value,

            start_date:
                document.getElementById(
                    'startDate'
                ).value,

            due_date:
                document.getElementById(
                    'dueDate'
                ).value
        };

        const res = await fetch(
            '/user/incident-work/create',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify(body)
            }
        );

        const json = await res.json();

        if (!json.success) {
            throw new Error(json.message);
        }

        window.location =
            `/tech/incident-work/${json.data.id}`;

    } catch (e) {

        alert(
            e.message || 'Create failed'
        );
    }
}

loadForm();