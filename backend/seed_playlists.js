const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedPlaylists() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog'
    });

    try {
        console.log('Seeding default playlists...');

        // 1. Create a "Featured Hits" playlist for the Admin user (ID 1)
        const [pResult] = await connection.query(
            'INSERT INTO Playlists (user_id, name, description) VALUES (?, ?, ?)',
            [1, 'Featured Tamil Hits', 'The best of Tamil music in one place']
        );
        const playlistId = pResult.insertId;

        // 2. Find some Tamil songs to add to it
        const [songs] = await connection.query(
            'SELECT id FROM Songs WHERE language = "Tamil" LIMIT 15'
        );

        if (songs.length > 0) {
            const values = songs.map(s => [playlistId, s.id]);
            await connection.query(
                'INSERT INTO PlaylistSongs (playlist_id, song_id) VALUES ?',
                [values]
            );
            console.log(`✅ Created "Featured Tamil Hits" with ${songs.length} songs.`);
        }

        // 3. Create a "Chill Melodies" playlist
        const [pResult2] = await connection.query(
            'INSERT INTO Playlists (user_id, name, description) VALUES (?, ?, ?)',
            [1, 'Hindi Melodies', 'Relaxing Hindi tracks']
        );
        const playlistId2 = pResult2.insertId;

        const [songs2] = await connection.query(
            'SELECT id FROM Songs WHERE language = "Hindi" LIMIT 10'
        );

        if (songs2.length > 0) {
            const values2 = songs2.map(s => [playlistId2, s.id]);
            await connection.query(
                'INSERT INTO PlaylistSongs (playlist_id, song_id) VALUES ?',
                [values2]
            );
            console.log(`✅ Created "Hindi Melodies" with ${songs2.length} songs.`);
        }

        console.log('\nSeeding complete! Refresh your Library to see the new playlists.');

    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

seedPlaylists();
