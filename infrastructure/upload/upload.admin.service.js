const fs = require('fs');
const sharp = require('sharp');

const uploadService = require('./upload.service');

exports.rotateImage = async (
    file_id,
    direction,
    campus_id
) => {

    const file = await uploadService.getFileById(file_id);

    if (!file) {
        throw new Error('File not found');
    }

    // security
    if (
        campus_id &&
        file.campus_id !== campus_id
    ) {
        throw new Error('Forbidden');
    }

    const filePath = file.stored_path;

    if (!fs.existsSync(filePath)) {
        throw new Error('Physical file missing');
    }

    let angle = 0;

    switch (direction) {

        case 'left':
            angle = -90;
            break;

        case 'right':
            angle = 90;
            break;

        default:
            throw new Error('Invalid direction');
    }

    const tmp = filePath + '.tmp.jpg';

    await sharp(filePath)
        .rotate(angle)
        .jpeg({
            quality: 80
        })
        .toFile(tmp);

    fs.unlinkSync(filePath);

    fs.renameSync(tmp, filePath);

    return true;
};