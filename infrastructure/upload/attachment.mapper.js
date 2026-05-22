// infrastructure/upload/attachment.mapper.js

const { FILE_CATEGORY } = require('./file.constants');

// Map attachment_type (API) → file_category (DB)
const ATTACHMENT_TYPE_MAP = {
    result_file: FILE_CATEGORY.RESULT_FILE,
    supporting_image: FILE_CATEGORY.IMAGE,
    maintenance_record: FILE_CATEGORY.MAINTENANCE_RECORD
};

// Map function
const mapAttachmentType = (attachment_type) => {
    const category = ATTACHMENT_TYPE_MAP[attachment_type];

    if (!category) {
        throw new Error(`Invalid attachment_type: ${attachment_type}`);
    }

    return category;
};

// Optional: expose list for validation/UI
const getAllowedAttachmentTypes = () => {
    return Object.keys(ATTACHMENT_TYPE_MAP);
};

module.exports = {
    mapAttachmentType,
    getAllowedAttachmentTypes
};