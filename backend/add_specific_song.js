const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config();

const term = 'Kanave Kanave';

const fetchSong = (query) => {
    return new Promise((resolve, reject) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data).results[0]); } catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
};

async function addSpecificSong() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog'
        });

        const song = await fetchSong(term);
        if (!song) {
            console.log('Song not found on iTunes');
            process.exit(1);
        }

        const artworkUrl = song.artworkUrl100 ? song.artworkUrl100.replace('100x100bb', '600x600bb') : '';

        await connection.query(
            'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                song.trackName,
                song.artistName,
                song.collectionName || 'Single',
                song.primaryGenreName || 'Soundtrack',
                'Tamil',
                Math.floor(song.trackTimeMillis / 1000) || 180,
                song.previewUrl,
                artworkUrl
            ]
        );

        console.log(`Successfully added: ${song.trackName} by ${song.artistName}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addSpecificSong();
