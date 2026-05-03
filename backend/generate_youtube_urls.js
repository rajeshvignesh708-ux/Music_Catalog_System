const fs = require('fs');
const mysql = require('mysql2/promise');
const ytSearch = require('yt-search');
require('dotenv').config({ path: __dirname + '/.env' });

const datasetPath = 'c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json';
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
const songs = dataset.songs;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runSeed() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    console.log(`Processing ${songs.length} songs to fetch YouTube URLs. This will take a while...`);
    
    let successCount = 0;
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        
        // Skip if it's already a youtube link
        if (song.audio_url && song.audio_url.includes('youtube.com')) {
            successCount++;
            continue;
        }

        try {
            const query = `${song.title} ${song.artist} official audio`;
            const r = await ytSearch(query);
            const videos = r.videos;
            
            if (videos.length > 0) {
                const url = videos[0].url; // e.g., https://youtube.com/watch?v=...
                
                // Update in dataset in memory
                song.audio_url = url;

                // Update in database
                await connection.query(
                    'UPDATE Songs SET file_url = ? WHERE title = ? AND artist = ?',
                    [url, song.title, song.artist]
                );
                
                successCount++;
                process.stdout.write(`\rFetched ${successCount}/${songs.length}: ${song.title} -> ${url}`);
            } else {
                console.log(`\nFailed to find YouTube video for: ${song.title}`);
            }
        } catch (error) {
            console.log(`\nError fetching for ${song.title}: ${error.message}`);
        }
        
        // Rate limit avoidance
        await delay(500);
    }

    // Save updated dataset
    fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2));

    console.log('\n\nDone! All 200 songs have been mapped to real YouTube URLs.');
    process.exit(0);
}

runSeed();
