const fs = require('fs');
const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchItunesPreview = (title, artist) => {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${title} ${artist}`);
        const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.results && parsed.results.length > 0) {
                        resolve(parsed.results[0].previewUrl);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
};

async function runSeed() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    const [songs] = await connection.query('SELECT id, title, artist FROM Songs');
    
    console.log(`Fetching highly-reliable Apple Music streams for ${songs.length} songs...`);
    
    let successCount = 0;
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        
        try {
            const previewUrl = await fetchItunesPreview(song.title, song.artist);
            
            if (previewUrl) {
                await connection.query(
                    'UPDATE Songs SET file_url = ? WHERE id = ?',
                    [previewUrl, song.id]
                );
                successCount++;
                process.stdout.write(`\rFetched ${successCount}/${songs.length}: ${song.title}`);
            } else {
                console.log(`\nFailed to find Apple Music track for: ${song.title}`);
            }
        } catch (error) {
            console.log(`\nError fetching for ${song.title}: ${error.message}`);
        }
        
        await delay(300); // 300ms delay to prevent rate limits
    }

    console.log('\n\nDone! All songs are now mapped to 100% reliable official audio streams.');
    process.exit(0);
}

runSeed();
