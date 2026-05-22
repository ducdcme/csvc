// infrastructure/upload/upload.middleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [

    // images
    'image/jpeg',
    'image/png',
    'image/webp',

    // documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // text
    'text/plain',
    // csv
    'text/csv'

];
const fileFilter = (
    req,
    file,
    cb
) => {

    if (
        !ALLOWED_MIME_TYPES.includes(
            file.mimetype
        )
    ) {

        return cb(
            new Error(
                'File type not allowed'
            )
        );

    }

    cb(null, true);

};
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const { isValidModule } = require('./file.constants');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        try {

            let uploadDir = UPLOAD_DIR;

            // optional module_name
            const module_name = req.body.module_name || req.query.module_name || req.params.module_name;
            if (
                module_name &&
                !isValidModule(module_name)
            ) {
                throw new Error(
                    `Invalid module_name: ${module_name}`
                );
            }
            // only use module folder if valid
            if (
                module_name &&
                isValidModule(module_name)
            ) {

                uploadDir = path.join(
                    UPLOAD_DIR,
                    module_name
                );
            }

            // ensure dir exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(
                    uploadDir,
                    { recursive: true }
                );
            }

            cb(null, uploadDir);

        } catch (err) {

            cb(err);

        }

    },
    filename: (_, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter
});

const isImage = (mime) => mime.startsWith('image/');

// compress image
const compressImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        if (isImage(req.file.mimetype)) {

            const filePath = req.file.path;

            const tmp = filePath + '-compressed.jpg';

            // ===== watermark =====
            const timestamp =
                new Date().toLocaleString(
                    'vi-VN',
                    {
                        timeZone: 'Asia/Ho_Chi_Minh'
                    }
                );

            const campusText =
                req.campus_name ||
                `Campus ${req.campus_id || ''}`;

            const svg = `
        <svg width="500" height="80">

            <rect
                x="0"
                y="0"
                width="500"
                height="80"
                fill="rgba(0,0,0,0.45)"
            />

            <text
                x="20"
                y="32"
                fill="white"
                font-size="20"
                font-weight="bold"
            >
                ${timestamp}
            </text>

            <text
                x="20"
                y="60"
                fill="white"
                font-size="18"
            >
                ${campusText}
            </text>

        </svg>
    `;

            await sharp(filePath)

                // fix mobile orientation
                .rotate()

                // resize large image only
                .resize({
                    width: 1280,
                    withoutEnlargement: true
                })

                // watermark
                .composite([
                    {
                        input: Buffer.from(svg),
                        gravity: 'southwest'
                    }
                ])

                // output
                .jpeg({
                    quality: 70
                })

                .toFile(tmp);

            // replace original
            fs.unlinkSync(filePath);

            fs.renameSync(tmp, filePath);

            req.file.mimetype = 'image/jpeg';

            req.file.size =
                fs.statSync(filePath).size;
        }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadSingle: upload.single('file'),
    compressImage
};