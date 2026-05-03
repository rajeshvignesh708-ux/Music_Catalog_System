const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

const FALLBACK_YT_URL = 'https://youtube.com/watch?v=DQgIut9r0JE';

async function runSeed() {
    console.log('Connecting to database to restore YouTube URLs...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    const dataset = JSON.parse(fs.readFileSync('c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json', 'utf-8'));
    
    let successCount = 0;
    
    for (const song of dataset.songs) {
        let url = song.audio_url;
        if (!url || !url.includes('youtube.com')) {
            url = FALLBACK_YT_URL;
        }

        await connection.query(
            'UPDATE Songs SET file_url = ? WHERE title = ? AND artist = ?',
            [url, song.title, song.artist]
        );
        successCount++;
    }

    console.log(`Successfully restored ${successCount} YouTube URLs to the database!`);
    process.exit(0);
}

runSeed();
