// infrastructure/upload/file.constants.js

// Module name (map với DB column: module_name)
const FILE_MODULE = {
    REPAIR: 'repair',
    PERIODIC: 'periodic',
    INSPECTION: 'inspection',
    INCIDENT: 'incident'
};

// File category (map với DB column: file_category)
const FILE_CATEGORY = {
    IMAGE: 'image',
    RESULT_FILE: 'result_file',
    DOCUMENT: 'document',
    MAINTENANCE_RECORD: 'maintenance_record'
};

// helper validate
const isValidModule = (module) => {
    return Object.values(FILE_MODULE).includes(module);
};

const isValidCategory = (category) => {
    return Object.values(FILE_CATEGORY).includes(category);
};

module.exports = {
    FILE_MODULE,
    FILE_CATEGORY,
    isValidModule,
    isValidCategory
};