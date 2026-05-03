const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function updateAudio() {
    try {
        console.log("Connecting to WAMP MySQL server...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog',
            port: 3306
        });

        console.log("Updating songs with a real audio URL...");
        
        // We'll use a mix of 3 real sample MP3s to give a bit of variety
        const urls = [
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        ];

        const [songs] = await connection.query('SELECT id FROM Songs');
        
        for (let i = 0; i < songs.length; i++) {
            const songId = songs[i].id;
            const url = urls[i % 3];
            await connection.query('UPDATE Songs SET file_url = ? WHERE id = ?', [url, songId]);
        }

        console.log(`Updated ${songs.length} songs with working audio URLs.`);
        await connection.end();
    } catch (error) {
        console.error("Error updating audio URLs:", error);
    }
}

updateAudio();
