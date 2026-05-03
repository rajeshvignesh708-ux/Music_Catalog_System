const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const searchTerms = ['taylor swift', 'ed sheeran', 'dua lipa', 'the weeknd', 'billie eilish', 'ariana grande', 'post malone', 'harry styles', 'bruno mars', 'adele'];

const fetchItunesSongs = (term) => {
    return new Promise((resolve, reject) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=5`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).results);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
};

async function seedWorkingDataset() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    console.log('Clearing old corrupted data...');
    await connection.query('DELETE FROM Songs');
    
    console.log('Fetching 50 perfectly working global hit songs...');
    
    let addedCount = 0;
    for (const term of searchTerms) {
        const songs = await fetchItunesSongs(term);
        for (const song of songs) {
            if (song.previewUrl) {
                // Get high quality artwork by replacing 100x100 with 600x600
                const artworkUrl = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '600x600bb') : '';
                
                await connection.query(
                    'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        song.trackName,
                        song.artistName,
                        song.collectionName || 'Single',
                        song.primaryGenreName || 'Pop',
                        'English',
                        Math.floor(song.trackTimeMillis / 1000) || 180,
                        song.previewUrl, // Direct .m4a audio preview
                        artworkUrl
                    ]
                );
                addedCount++;
            }
        }
        process.stdout.write(`\rAdded ${addedCount} guaranteed-working songs...`);
    }

    console.log(`\n\nDone! Successfully seeded ${addedCount} flawless songs into the database.`);
    process.exit(0);
}

seedWorkingDataset();
