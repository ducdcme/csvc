const repo = require('./contractor.repository');

function validate(data) {
    if (!data.name?.trim()) {
        throw new Error('Contractor name required');
    }

    if (!data.contact?.trim()) {
        throw new Error('Contact required');
    }

    if (!data.phone?.trim()) {
        throw new Error('Phone required');
    }

    if (data.contact2 && !data.phone2) {
        throw new Error('Phone 2 required');
    }

    if (data.phone2 && !data.contact2) {
        throw new Error('Contact 2 required');
    }
}

// GET LIST
exports.getList = async () => {
    return repo.getList();
};

// GET DETAIL
exports.getById = async (id) => {
    const contractor = await repo.getById(id);

    if (!contractor) {
        throw new Error('Contractor not found');
    }

    return contractor;
};

// CREATE
exports.create = async (data) => {
    validate(data);

    return repo.create(data);
};

// UPDATE
exports.update = async (id, data) => {
    const contractor = await repo.getById(id);

    if (!contractor) {
        throw new Error('Contractor not found');
    }

    validate(data);

    return repo.update(id, data);
};

// DELETE
exports.delete = async (id) => {
    const contractor = await repo.getById(id);

    if (!contractor) {
        throw new Error('Contractor not found');
    }

    await repo.delete(id);

    return true;
};