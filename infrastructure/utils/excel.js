const XLSX = require('xlsx');

exports.readExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets['IMPORT'] || workbook.Sheets[workbook.SheetNames[0]];; // 🔥 FIX Ở ĐÂY

    if (!sheet) {
        throw new Error('Sheet IMPORT not found');
    }

    const raw = XLSX.utils.sheet_to_json(sheet);

    return raw.map(row => {
        const newRow = {};

        Object.keys(row).forEach(key => {
            const normalizedKey = key
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[\uFEFF]/g, '');

            newRow[normalizedKey] = row[key];
        });

        return newRow;
    });
};