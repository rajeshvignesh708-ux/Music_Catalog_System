const mysql = require('mysql2/promise');
const https = require('https');
const ytSearch = require('yt-search');
require('dotenv').config({ path: __dirname + '/.env' });

const searchTerms = [
    { query: 'anirudh ravichander', lang: 'Tamil' },
    { query: 'a.r. rahman tamil', lang: 'Tamil' },
    { query: 'arijit singh', lang: 'Hindi' },
    { query: 'shreya ghoshal hindi', lang: 'Hindi' },
    { query: 'taylor swift', lang: 'English' },
    { query: 'the weeknd', lang: 'English' }
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

async function seedFullSongs() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    console.log('Clearing old data to prepare for FULL songs (Tamil, Hindi, English)...');
    await connection.query('DELETE FROM Songs');
    
    console.log('Fetching metadata and lyric videos...');
    
    let addedCount = 0;
    for (const group of searchTerms) {
        console.log(`\nProcessing ${group.lang} (${group.query})...`);
        const songs = await fetchItunesSongs(group.query);
        
        for (const song of songs) {
            try {
                // Search YouTube for an unofficial lyric video to bypass embedding restrictions
                const ytQuery = `${song.trackName} ${song.artistName} lyric video`;
                const r = await ytSearch(ytQuery);
                const videos = r.videos;
                
                if (videos.length > 0) {
                    const ytUrl = videos[0].url;
                    const artworkUrl = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '600x600bb') : '';
                    
                    await connection.query(
                        'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            song.trackName,
                            song.artistName,
                            song.collectionName || 'Single',
                            song.primaryGenreName || 'Pop',
                            group.lang,
                            Math.floor(song.trackTimeMillis / 1000) || 180,
                            ytUrl, // Full length YouTube URL
                            artworkUrl
                        ]
                    );
                    addedCount++;
                    process.stdout.write(`\rAdded ${addedCount} full-length songs...`);
                }
            } catch (err) {
                // Ignore search errors and continue
            }
            
            // Wait 500ms to avoid YouTube rate limiting
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`\n\nDone! Successfully seeded ${addedCount} full-length songs into the database.`);
    process.exit(0);
}

seedFullSongs();
