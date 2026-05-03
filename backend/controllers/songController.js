const db = require('../config/db');

// @desc    Get all songs (with optional search, filter, pagination)
// @route   GET /api/songs
const getSongs = async (req, res) => {
    try {
        const { search, genre, language, sortBy, sortOrder = 'DESC', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM Songs WHERE 1=1';
        let queryParams = [];

        if (search) {
            query += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
            const searchParam = `%${search}%`;
            queryParams.push(searchParam, searchParam, searchParam);
        }

        if (genre) {
            query += ' AND genre = ?';
            queryParams.push(genre);
        }
        
        if (language) {
            query += ' AND language = ?';
            queryParams.push(language);
        }

        // Only allow safe values to prevent SQL injection
        const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let orderClause = ` ORDER BY created_at ${safeOrder}`;
        if (sortBy === 'title') orderClause = ` ORDER BY title ${safeOrder}`;
        if (sortBy === 'artist') orderClause = ` ORDER BY artist ${safeOrder}`;
        if (sortBy === 'duration') orderClause = ` ORDER BY duration ${safeOrder}`;

        query += orderClause + ' LIMIT ? OFFSET ?';
        // Needs to be cast to numbers for limit/offset in mysql2
        queryParams.push(Number(limit), Number(offset));

        const [songs] = await db.query(query, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM Songs WHERE 1=1';
        let countParams = [];
        if (search) {
            countQuery += ' AND (title LIKE ? OR artist LIKE ? OR album LIKE ?)';
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam, searchParam);
        }
        if (genre) {
            countQuery += ' AND genre = ?';
            countParams.push(genre);
        }
        if (language) {
            countQuery += ' AND language = ?';
            countParams.push(language);
        }
        
        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            songs,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching songs' });
    }
};

// @desc    Add a song
// @route   POST /api/songs
const addSong = async (req, res) => {
    try {
        const { title, artist, album, genre, language, duration } = req.body;
        
        let file_url = req.body.file_url || '';
        let cover_url = req.body.cover_url || '';

        if (req.files) {
            if (req.files.audio_file && req.files.audio_file[0]) {
                file_url = 'http://localhost:5000/uploads/audio/' + req.files.audio_file[0].filename;
            }
            if (req.files.cover_file && req.files.cover_file[0]) {
                cover_url = 'http://localhost:5000/uploads/images/' + req.files.cover_file[0].filename;
            }
        }
        
        if (!title) return res.status(400).json({ message: 'Song title is required' });
        if (!artist) return res.status(400).json({ message: 'Artist name is required' });
        if (!file_url) return res.status(400).json({ message: 'Audio URL is required' });

        const [result] = await db.query(
            'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                title,
                artist,
                album || 'Single',
                genre || 'Pop',
                language || 'Tamil',
                duration ? parseInt(duration) : 180,
                file_url,
                cover_url || ''
            ]
        );

        res.status(201).json({ id: result.insertId, title, artist, file_url, cover_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding song' });
    }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
const updateSong = async (req, res) => {
    try {
        const { title, artist, album, genre, language, duration } = req.body;
        const songId = req.params.id;

        let file_url = req.body.file_url || '';
        let cover_url = req.body.cover_url || '';

        if (req.files) {
            if (req.files.audio_file && req.files.audio_file[0]) {
                file_url = 'http://localhost:5000/uploads/audio/' + req.files.audio_file[0].filename;
            }
            if (req.files.cover_file && req.files.cover_file[0]) {
                cover_url = 'http://localhost:5000/uploads/images/' + req.files.cover_file[0].filename;
            }
        }

        const [result] = await db.query(
            'UPDATE Songs SET title=?, artist=?, album=?, genre=?, language=?, duration=?, file_url=?, cover_url=? WHERE id=?',
            [title, artist, album, genre, language || 'English', duration, file_url, cover_url, songId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Song not found' });
        }

        res.json({ message: 'Song updated successfully', id: songId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating song' });
    }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
const deleteSong = async (req, res) => {
    try {
        const songId = req.params.id;
        const [result] = await db.query('DELETE FROM Songs WHERE id = ?', [songId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Song not found' });
        }

        res.json({ message: 'Song removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting song' });
    }
};

module.exports = { getSongs, addSong, updateSong, deleteSong };
