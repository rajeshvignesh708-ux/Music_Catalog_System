const express = require('express');
const router = express.Router();
const { createPlaylist, getAllPlaylists, getUserPlaylists, addSongToPlaylist, removeSongFromPlaylist, getPlaylistSongs, deletePlaylist } = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All playlist routes require authentication

router.get('/all', getAllPlaylists);
router.post('/', createPlaylist);
router.delete('/:id', deletePlaylist);
router.get('/user/:userId', getUserPlaylists);
router.get('/:id', getPlaylistSongs);
router.post('/:id/add-song', addSongToPlaylist);
router.delete('/:id/remove-song/:songId', removeSongFromPlaylist);

module.exports = router;
