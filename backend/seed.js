const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDB() {
    console.log("Connecting to WAMP MySQL server to seed data...");
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog',
            multipleStatements: true
        });

        console.log("Applying fresh schema...");
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
        console.log("Schema applied (Users created, other tables empty).");

        console.log("Reading dataset...");
        const dataPath = path.join(__dirname, '../dataset.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Inserting ${data.songs.length} songs...`);
        const songValues = data.songs.map(s => [
            s.id, s.title, s.artist, s.album, s.genre, s.language, s.duration, s.file_url || s.audio_url, s.cover_url
        ]);
        await connection.query(
            `INSERT INTO Songs (id, title, artist, album, genre, language, duration, file_url, cover_url) VALUES ?`,
            [songValues]
        );

        console.log(`Inserting ${data.playlists.length} curated playlists...`);
        // Assigning to admin user (id=1)
        const playlistValues = data.playlists.map(p => [
            p.id, 1, p.name, p.description
        ]);
        await connection.query(
            `INSERT INTO Playlists (id, user_id, name, description) VALUES ?`,
            [playlistValues]
        );

        console.log("Linking songs to playlists...");
        const playlistSongsValues = [];
        data.playlists.forEach(playlist => {
            playlist.song_ids.forEach(songId => {
                playlistSongsValues.push([playlist.id, songId]);
            });
        });
        await connection.query(
            `INSERT INTO PlaylistSongs (playlist_id, song_id) VALUES ?`,
            [playlistSongsValues]
        );

        console.log("🎉 Database successfully seeded with 150 songs and 6 playlists!");
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDB();
