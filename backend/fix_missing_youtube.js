const mysql = require('mysql2/promise');
const ytSearch = require('yt-search');
require('dotenv').config({ path: __dirname + '/.env' });

const FALLBACK_URL = 'https://youtube.com/watch?v=DQgIut9r0JE';

async function fixSongs() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    const [songs] = await connection.query('SELECT id, title, artist FROM Songs WHERE file_url = ? AND id != 1', [FALLBACK_URL]);
    
    console.log(`Found ${songs.length} songs with fallback URLs. Fetching real URLs...`);
    
    let successCount = 0;
    
    for (const song of songs) {
        try {
            const query = `${song.title} ${song.artist} tamil song audio`;
            const r = await ytSearch(query);
            const videos = r.videos;
            
            if (videos.length > 0) {
                const url = videos[0].url;
                await connection.query('UPDATE Songs SET file_url = ? WHERE id = ?', [url, song.id]);
                successCount++;
                console.log(`Updated: ${song.title} -> ${url}`);
            } else {
                console.log(`Failed to find YouTube video for: ${song.title}`);
            }
        } catch (error) {
            console.log(`Error fetching for ${song.title}: ${error.message}`);
        }
        
        // Wait 500ms to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\nSuccessfully updated ${successCount} out of ${songs.length} songs!`);
    process.exit(0);
}

fixSongs();
