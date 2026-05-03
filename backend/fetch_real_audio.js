const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const fetchItunesPreview = (title, artist) => {
    return new Promise((resolve) => {
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
                            artworkUrl: parsed.results[0].artworkUrl100
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};

async function updateRealAudio() {
    try {
        console.log("Connecting to WAMP MySQL server...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog',
            port: 3306
        });

        const [songs] = await connection.query('SELECT id, title, artist FROM Songs');
        console.log(`Fetching real audio previews for ${songs.length} songs... This might take a minute.`);
        
        let successCount = 0;

        for (let i = 0; i < songs.length; i++) {
            const { id, title, artist } = songs[i];
            
            // Adding a small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));

            const itunesData = await fetchItunesPreview(title, artist);
            
            if (itunesData && itunesData.previewUrl) {
                // Update with real audio preview and real cover art
                let highResCover = itunesData.artworkUrl.replace('100x100bb', '600x600bb');
                await connection.query(
                    'UPDATE Songs SET file_url = ?, cover_url = ? WHERE id = ?', 
                    [itunesData.previewUrl, highResCover, id]
                );
                successCount++;
                process.stdout.write(`\rUpdated ${successCount}/${songs.length} songs`);
            }
        }

        console.log(`\nSuccessfully updated ${successCount} out of ${songs.length} songs with REAL iTunes audio previews!`);
        await connection.end();
    } catch (error) {
        console.error("Error updating audio URLs:", error);
    }
}

updateRealAudio();
