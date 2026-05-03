const db = require('../config/db');

// @desc    Create a playlist
// @route   POST /api/playlists
const createPlaylist = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO Playlists (user_id, name) VALUES (?, ?)',
            [userId, name]
        );

        res.status(201).json({ id: result.insertId, user_id: userId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating playlist' });
    }
};

// @desc    Get all public/curated playlists
// @route   GET /api/playlists
const getAllPlaylists = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = 'SELECT * FROM Playlists';
        let params = [];

        if (role !== 'admin') {
            // Show only user's own playlists OR playlists created by admins (public)
            query += ' WHERE user_id = ? OR user_id IN (SELECT id FROM Users WHERE role = "admin")';
            params = [userId];
        }

        query += ' ORDER BY created_at DESC';
        const [playlists] = await db.query(query, params);
        res.json(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching all playlists' });
    }
};

// @desc    Get playlists for a specific user
// @route   GET /api/playlists/user/:userId
const getUserPlaylists = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Ensure user can only get their own playlists, unless admin
        if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these playlists' });
        }

        const [playlists] = await db.query('SELECT * FROM Playlists WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        
        res.json(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching playlists' });
    }
};

// @desc    Get songs in a playlist
// @route   GET /api/playlists/:id
const getPlaylistSongs = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Verify playlist belongs to user
        const [playlists] = await db.query('SELECT * FROM Playlists WHERE id = ?', [playlistId]);
        if (playlists.length === 0) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Verify playlist belongs to user OR is an admin (public) playlist
        const isAdminOwned = await db.query('SELECT role FROM Users WHERE id = ?', [playlists[0].user_id]);
        const isPublic = isAdminOwned[0] && isAdminOwned[0][0]?.role === 'admin';

        if (playlists[0].user_id !== req.user.id && req.user.role !== 'admin' && !isPublic) {
            return res.status(403).json({ message: 'Not authorized to view this playlist' });
        }

        const query = `
            SELECT s.*, ps.added_at 
            FROM Songs s
            JOIN PlaylistSongs ps ON s.id = ps.song_id
            WHERE ps.playlist_id = ?
            ORDER BY ps.added_at DESC
        `;
        const [songs] = await db.query(query, [playlistId]);

        res.json({
            playlist: playlists[0],
            songs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching playlist songs' });
    }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/add-song
const addSongToPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const { songId } = req.body;

        if (!songId) {
            return res.status(400).json({ message: 'Song ID is required' });
        }

        // Verify playlist belongs to user
        const [playlists] = await db.query('SELECT * FROM Playlists WHERE id = ?', [playlistId]);
        if (playlists.length === 0) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        if (playlists[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        // Check if song is already in playlist
        const [existing] = await db.query(
            'SELECT * FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?',
            [playlistId, songId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Song is already in the playlist' });
        }

        const [result] = await db.query(
            'INSERT INTO PlaylistSongs (playlist_id, song_id) VALUES (?, ?)',
            [playlistId, songId]
        );

        res.status(201).json({ message: 'Song added to playlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding song to playlist' });
    }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/remove-song/:songId
const removeSongFromPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;
        const songId = req.params.songId;

        // Verify playlist belongs to user
        const [playlists] = await db.query('SELECT * FROM Playlists WHERE id = ?', [playlistId]);
        if (playlists.length === 0) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        if (playlists[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        const [result] = await db.query(
            'DELETE FROM PlaylistSongs WHERE playlist_id = ? AND song_id = ?',
            [playlistId, songId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Song not found in playlist' });
        }

        res.json({ message: 'Song removed from playlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing song from playlist' });
    }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
const deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.id;

        // Verify playlist belongs to user
        const [playlists] = await db.query('SELECT * FROM Playlists WHERE id = ?', [playlistId]);
        if (playlists.length === 0) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        if (playlists[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this playlist' });
        }

        // Delete from PlaylistSongs first due to foreign key constraints if not ON DELETE CASCADE
        await db.query('DELETE FROM PlaylistSongs WHERE playlist_id = ?', [playlistId]);
        
        // Delete the playlist
        await db.query('DELETE FROM Playlists WHERE id = ?', [playlistId]);

        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting playlist' });
    }
};

module.exports = { createPlaylist, getAllPlaylists, getUserPlaylists, getPlaylistSongs, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist };
