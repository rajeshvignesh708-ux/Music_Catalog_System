const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function fixImages() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    const [songs] = await connection.query('SELECT id, file_url FROM Songs WHERE file_url LIKE "%youtube.com/watch?v=%"');
    
    let updatedCount = 0;
    
    for (const song of songs) {
        // Extract video ID from URL e.g. https://youtube.com/watch?v=DQgIut9r0JE
        try {
            const url = new URL(song.file_url);
            const videoId = url.searchParams.get('v');
            
            if (videoId) {
                const cover_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                await connection.query('UPDATE Songs SET cover_url = ? WHERE id = ?', [cover_url, song.id]);
                updatedCount++;
            }
        } catch(e) {
            // Ignore invalid URLs
        }
    }

    console.log(`Successfully updated ${updatedCount} cover images to their official YouTube thumbnails!`);
    process.exit(0);
}

fixImages();
