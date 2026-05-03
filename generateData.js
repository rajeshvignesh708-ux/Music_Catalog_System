const fs = require('fs');

const tamilSongs = ["Rowdy Baby", "Aalaporan Thamizhan", "Why This Kolaveri Di", "Innum Konjam Naeram", "Kannana Kanne", "Apdi Podu", "Arabic Kuthu", "Vaathi Coming", "Kutty Story", "Enjoy Enjaami"];
const englishSongs = ["Shape of You", "Blinding Lights", "Dance Monkey", "Rockstar", "Someone You Loved", "Watermelon Sugar", "Levitating", "Peaches", "Stay", "Bad Guy"];
const hindiSongs = ["Tum Hi Ho", "Channa Mereya", "Kal Ho Naa Ho", "Kabira", "Gerua", "Raabta", "Ae Dil Hai Mushkil", "Zaalima", "Kar Gayi Chull", "Kala Chashma"];

const tamilArtists = ["Anirudh Ravichander", "A.R. Rahman", "Dhanush", "Sid Sriram", "Vijay Prakash"];
const englishArtists = ["Ed Sheeran", "The Weeknd", "Dua Lipa", "Justin Bieber", "Billie Eilish"];
const hindiArtists = ["Arijit Singh", "Sonu Nigam", "Shreya Ghoshal", "Neha Kakkar", "Badshah"];

const genres = ["Pop", "Melody", "Romantic", "Folk", "Hip-Hop", "Classical", "EDM"];

let songs = [];
let idCounter = 1;

function generateSongs(language, titles, artists, count) {
    for (let i = 0; i < count; i++) {
        const title = titles[i % titles.length] + (i >= titles.length ? ` (Mix ${Math.floor(i/titles.length) + 1})` : "");
        const artist = artists[i % artists.length];
        const genre = genres[Math.floor(Math.random() * genres.length)];
        const duration = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
        
        songs.push({
            id: idCounter,
            title: title,
            artist: artist,
            album: `${title} Album`,
            language: language,
            genre: genre,
            duration: duration,
            cover_url: `https://picsum.photos/200?random=${idCounter}`,
            audio_url: `https://example.com/audio/song${idCounter}.mp3`,
            liked: Math.random() > 0.5,
            created_at: new Date().toISOString()
        });
        idCounter++;
    }
}

generateSongs("Tamil", tamilSongs, tamilArtists, 50);
generateSongs("English", englishSongs, englishArtists, 50);
generateSongs("Hindi", hindiSongs, hindiArtists, 50);

const playlists = [
    { id: 1, name: "Tamil Hits", description: "Top hits in Tamil", song_ids: songs.filter(s => s.language === "Tamil").slice(0, 20).map(s => s.id) },
    { id: 2, name: "English Pop Hits", description: "Best English Pop", song_ids: songs.filter(s => s.language === "English" && s.genre === "Pop").slice(0, 15).map(s => s.id) },
    { id: 3, name: "Hindi Bollywood Hits", description: "Bollywood's best", song_ids: songs.filter(s => s.language === "Hindi").slice(0, 25).map(s => s.id) },
    { id: 4, name: "Chill Songs", description: "Relaxing vibes", song_ids: songs.filter(s => ["Melody", "Classical"].includes(s.genre)).slice(0, 20).map(s => s.id) },
    { id: 5, name: "Workout Songs", description: "Get pumped", song_ids: songs.filter(s => ["EDM", "Hip-Hop", "Rock"].includes(s.genre)).slice(0, 20).map(s => s.id) },
    { id: 6, name: "Love Songs", description: "Romantic tunes", song_ids: songs.filter(s => s.genre === "Romantic").slice(0, 20).map(s => s.id) }
];

const data = { songs, playlists };
fs.writeFileSync('dataset.json', JSON.stringify(data, null, 2));
console.log("dataset.json created successfully");
