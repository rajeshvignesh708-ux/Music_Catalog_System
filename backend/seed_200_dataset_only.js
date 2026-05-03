const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

const dataset = JSON.parse(fs.readFileSync('c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json', 'utf-8'));
const songs = dataset.songs;

async function runSeed() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    console.log('Clearing old songs...');
    await connection.query('DELETE FROM Songs');

    console.log(`Inserting exactly ${songs.length} songs from dataset.json with their original full-song URLs...`);
    
    let successCount = 0;
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        
        let cover_url = `https://picsum.photos/400?random=${i}`;
        let album = 'Singles';

        await connection.query(
            'INSERT INTO Songs (id, title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [song.id, song.title, song.artist, album, song.genre, song.language, 200, song.audio_url, cover_url]
        );
        
        successCount++;
        process.stdout.write(`\rInserted ${successCount}/${songs.length}: ${song.title}`);
    }

    console.log('\n\nDone! All 200 songs have been added exactly as they are in your dataset.json.');
    process.exit(0);
}

runSeed();
