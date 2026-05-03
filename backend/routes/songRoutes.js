const express = require('express');
const router = express.Router();
const { getSongs, addSong, updateSong, deleteSong } = require('../controllers/songController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getSongs)
    .post(protect, adminOnly, upload.fields([{ name: 'audio_file', maxCount: 1 }, { name: 'cover_file', maxCount: 1 }]), addSong);

router.route('/:id')
    .put(protect, adminOnly, upload.fields([{ name: 'audio_file', maxCount: 1 }, { name: 'cover_file', maxCount: 1 }]), updateSong)
    .delete(protect, adminOnly, deleteSong);

module.exports = router;
