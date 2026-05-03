const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

// Generic Tamil Hits YouTube Playlist video as fallback
const FALLBACK_YOUTUBE_URL = 'https://youtube.com/watch?v=rpIlP6pI8fo'; 

async function fallback() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'music_catalog',
        port: 3306
    });

    const [result] = await connection.query(
        'UPDATE Songs SET file_url = ? WHERE file_url NOT LIKE "%youtube.com%"',
        [FALLBACK_YOUTUBE_URL]
    );

    console.log(`Fallback applied to ${result.affectedRows} songs that were missing YouTube links.`);
    process.exit(0);
}

fallback();
