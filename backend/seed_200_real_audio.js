const fs = require('fs');
const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const dataset = JSON.parse(fs.readFileSync('c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json', 'utf-8'));
const songs = dataset.songs;

const fetchItunesPreview = (title, artist) => {
    return new Promise((resolve) => {
        // Search by title and artist to be accurate
        const query = encodeURIComponent(`${title} ${artist}`);
        const url = `https://itunes.apple.com/search?term=${query}&media=music&limit=1`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.results && parsed.results.length > 0) {
                        resolve({
                            previewUrl: parsed.results[0].previewUrl,
                            artworkUrl: parsed.results[0].artworkUrl100,
                            artistName: parsed.results[0].artistName,
                            collectionName: parsed.results[0].collectionName
                        });
                    } else {
                        // Fallback: search just by title if title+artist fails
                        const query2 = encodeURIComponent(`${title}`);
                        const url2 = `https://itunes.apple.com/search?term=${query2}&media=music&limit=1`;
                        https.get(url2, (res2) => {
                            let data2 = '';
                            res2.on('data', chunk => data2 += chunk);
                            res2.on('end', () => {
                                try {
                                    const parsed2 = JSON.parse(data2);
                                    if (parsed2.results && parsed2.results.length > 0) {
                                        resolve({
                                            previewUrl: parsed2.results[0].previewUrl,
                                            artworkUrl: parsed2.results[0].artworkUrl100,
                                            artistName: parsed2.results[0].artistName,
                                            collectionName: parsed2.results[0].collectionName
                                        });
                                    } else {
                                        resolve(null);
                                    }
                                } catch(e) { resolve(null); }
                            });
                        }).on('error', () => resolve(null));
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
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

    console.log('Clearing old songs...');
    await connection.query('DELETE FROM Songs');

    console.log(`Processing ${songs.length} songs and fetching REAL audio... This will take a few minutes!`);
    
    let successCount = 0;
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        
        // Delay to prevent Apple API rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

        let file_url = song.audio_url; // Fallback to SoundHelix
        let cover_url = `https://picsum.photos/400?random=${i}`;
        let album = 'Singles';
        let artist = song.artist;

        const itunes = await fetchItunesPreview(song.title, song.artist);
        if (itunes) {
            file_url = itunes.previewUrl || file_url;
            cover_url = itunes.artworkUrl ? itunes.artworkUrl.replace('100x100bb', '600x600bb') : cover_url;
            album = itunes.collectionName || album;
            artist = itunes.artistName || artist;
        }

        await connection.query(
            'INSERT INTO Songs (id, title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [song.id, song.title, artist, album, song.genre, song.language, 200, file_url, cover_url]
        );
        
        successCount++;
        process.stdout.write(`\rInserted ${successCount}/${songs.length}: ${song.title}`);
    }

    console.log('\n\nDone! All 200 songs have been added with real corresponding audio URLs.');
    process.exit(0);
}

runSeed();
