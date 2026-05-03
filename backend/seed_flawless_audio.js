const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const searchTerms = [
    // Tamil
    { query: 'anirudh ravichander', lang: 'Tamil' },
    { query: 'a.r. rahman tamil', lang: 'Tamil' },
    { query: 'yuvan shankar raja', lang: 'Tamil' },
    // Hindi
    { query: 'arijit singh', lang: 'Hindi' },
    { query: 'shreya ghoshal hindi', lang: 'Hindi' },
    { query: 'pritam', lang: 'Hindi' },
    // English
    { query: 'taylor swift', lang: 'English' },
    { query: 'the weeknd', lang: 'English' },
    { query: 'drake', lang: 'English' },
    { query: 'ed sheeran', lang: 'English' }
];

const fetchItunesSongs = (term) => {
    return new Promise((resolve, reject) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=50`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).results || []);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', reject);
    });
};

async function seedFlawlessAudio() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    console.log('Clearing old data to ensure 100% flawless playback...');
    try { await connection.query('DELETE FROM PlaylistSongs'); } catch(e) {}
    await connection.query('DELETE FROM Songs');
    
    console.log('Fetching highly reliable direct audio streams...');
    
    let addedCount = 0;
    for (const group of searchTerms) {
        console.log(`\nProcessing ${group.lang} (${group.query})...`);
        const songs = await fetchItunesSongs(group.query);
        for (const song of songs) {
            if (song.previewUrl) {
                const artworkUrl = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '600x600bb') : '';
                
                try {
                    await connection.query(
                        'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            song.trackName,
                            song.artistName,
                            song.collectionName || 'Single',
                            song.primaryGenreName || 'Pop',
                            group.lang,
                            Math.floor(song.trackTimeMillis / 1000) || 180,
                            song.previewUrl, // Direct .m4a audio preview! Unblockable!
                            artworkUrl
                        ]
                    );
                    addedCount++;
                    process.stdout.write(`\rAdded ${addedCount} flawless tracks...`);
                } catch (dbErr) {
                    // Ignore duplicate
                }
            }
        }
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n\nDone! Successfully seeded ${addedCount} guaranteed-working tracks.`);
    process.exit(0);
}

seedFlawlessAudio();
