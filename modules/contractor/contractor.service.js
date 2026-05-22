const repo = require('./contractor.repository');

// GET LIST
exports.getList = async () => {
    return repo.getList();
};

// CREATE
exports.create = async (data) => {
    if (!data.name) throw new Error('Name required');

    return repo.create({
        name: data.name,
        address: data.address,
        contact: data.contact,
        phone: data.phone,
        type: data.type
    });
};