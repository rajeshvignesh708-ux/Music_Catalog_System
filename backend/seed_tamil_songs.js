const mysql = require('mysql2/promise');
const https = require('https');
require('dotenv').config({ path: __dirname + '/.env' });

const tamilSongsList = [
    "Kannave Kannave", "Munbe Vaa", "Vaseegara", "Anbil Avan", "Thalli Pogathey", 
    "Enna Solla Pogirai", "New York Nagaram", "Hosanna", "Po Nee Po", "Oru Devathai", 
    "Nenjukkul Peidhidum", "Pachai Nirame", "Suttrum Vizhi", "Idhazhin Oram", 
    "Unakkenna Venum Sollu", "Kaathalae Kaathalae", "Anbae Peranbae", "Maruvaarthai", 
    "Yennai Maatrum Kadhale", "Kannamma", "Rowdy Baby", "Megham Karukatha", "Adiye", 
    "Innum Konjam Naeram", "Oxygen", "Vaan Varuvaan", "Yaanji", "High On Love", 
    "Nee Kavithaigala", "Kadhal Kan Kattudhe", "Vennilave Vennilave", "Poongatrile", 
    "Aaromale", "Mazhai Kuruvi", "Ennai Konjam Maatri", "Oru Maalai", "Snehithane", 
    "Ennavale Adi Ennavale", "Malare", "Thendral Vandhu", "Usure Pogudhey", "Ava Enna", 
    "Pookkal Pookkum", "Kangal Irandal", "Mun Andhi", "Venmegam", "En Kadhal Solla", 
    "Azhage Azhage", "Thuli Thuli", "Othaiyadi Pathayila"
];

const fetchItunesPreview = (title) => {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${title} Tamil`);
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
                            artist: parsed.results[0].artistName,
                            album: parsed.results[0].collectionName || 'Unknown Album'
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

async function seedTamilSongs() {
    try {
        console.log("Connecting to WAMP MySQL server...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog',
            port: 3306
        });

        console.log(`Adding ${tamilSongsList.length} Tamil Love & Feel-Good Songs to the database...`);
        let successCount = 0;

        for (let i = 0; i < tamilSongsList.length; i++) {
            const title = tamilSongsList[i];
            
            // Adding a small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 200));

            const itunesData = await fetchItunesPreview(title);
            
            let artist = 'Various Artists';
            let album = 'Tamil Love & Feel-Good Songs';
            let file_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Fallback
            let cover_url = `https://picsum.photos/400?random=${Math.floor(Math.random() * 1000)}`;

            if (itunesData) {
                artist = itunesData.artist;
                album = itunesData.album;
                file_url = itunesData.previewUrl || file_url;
                cover_url = itunesData.artworkUrl ? itunesData.artworkUrl.replace('100x100bb', '600x600bb') : cover_url;
            }

            await connection.query(
                'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [title, artist, album, 'Melody', 'Tamil', Math.floor(Math.random() * 60) + 180, file_url, cover_url]
            );

            successCount++;
            process.stdout.write(`\rAdded ${successCount}/${tamilSongsList.length} songs`);
        }

        console.log(`\nSuccessfully added ${successCount} Tamil Love & Feel-Good Songs!`);
        await connection.end();
    } catch (error) {
        console.error("Error adding Tamil songs:", error);
    }
}

seedTamilSongs();
