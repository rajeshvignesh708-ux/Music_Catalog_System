const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const audioDir = path.join(__dirname, '../uploads/audio');
const imageDir = path.join(__dirname, '../uploads/images');

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'audio_file') {
            cb(null, audioDir);
        } else if (file.fieldname === 'cover_file') {
            cb(null, imageDir);
        } else {
            cb(new Error('Invalid fieldname'), null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'audio_file') {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    } else if (file.fieldname === 'cover_file') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

module.exports = upload;
