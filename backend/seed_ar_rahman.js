const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

const arRahmanSongs = [
    "Kun Faya Kun", "Jai Ho", "Nadaan Parinde", "Dil Se Re", "Tum Tak", "Tere Bina", "Agar Tum Saath Ho", "Chaiyya Chaiyya",
    "Lukka Chuppi", "Roja Janeman", "Khwaja Mere Khwaja", "Taal Se Taal", "Maa Tujhe Salaam", "Mustafa Mustafa", "Urvasi Urvasi",
    "Humma Humma", "Tu Hi Re", "Yeh Jo Des Hai Tera", "Azeem-O-Shaan Shahenshah", "Jashn-E-Bahaara", "Masakali", "Sadda Haq",
    "Patakha Guddi", "Raanjhanaa", "Pudhu Vellai Mazhai", "Ennavale Adi Ennavale", "Vennilave Vennilave", "Thee Thee",
    "Nila Kaigirathu", "Uyire Uyire", "Anjali Anjali", "Minsara Kanna", "Hosanna", "Aaromale", "Vinnathaandi Varuvaayaa",
    "Munbe Vaa", "New York Nagaram", "Ale Ale", "Snehithane Snehithane", "Kappaleri Poyaachu", "Pachai Nirame",
    "Ennodu Nee Irundhaal", "Mental Manadhil", "Neethanae", "Aalaporan Thamizhan", "Neethanae Neethanae", "Maruthaani",
    "Maduraikku Pogathadee", "Balleilakka", "Sahana", "Vaaji Vaaji", "Athiradee", "Sivaji", "Enthaaraa Enthaaraa", "Nenjukkule",
    "Adiye", "Narumugaye", "Kannalane", "Oruvan Oruvan", "Muthu Mazhai", "Thirakkadha", "Swasame", "Thalli Pogathey",
    "Rasaali", "Showkali", "Idhu Naal", "Hayati", "Mazhai Kuruvi", "Kurumba", "Poraadalaam", "Kalvare", "Kuru Kuru",
    "Vinnaithaandi Varuvaaya", "Kannukkul Kannai", "Enna Solla Pogirai", "Kandukondain Kandukondain", "Evano Oruvan",
    "Kadhal Sadugudu", "Pachai Kiligal", "Suttum Vizhi", "Oru Deivam Thandha", "Mun Paniya", "Omana Penne", "Vinnaithaandi",
    "Kaadhal Rojave", "Chinna Chinna Aasai", "Putham Pudhu Bhoomi", "Thamizha Thamizha", "Anbendra", "Thiruda Thiruda",
    "Veerapandi", "Konjam Nilavu", "Rasathi", "Chandiranai Thottathu", "Margazhi Poove", "Nenjil Jil Jil", "Azhagana Rakshasiye",
    "Ooh La La La", "Ennai Kaanavillaye", "Poo Pookum Osai", "Minsara Poove", "Telephone Manipol", "Vasantha Mullai",
    "Shakalaka Baby", "Mudhalvane", "Azhagiye", "Sarvam Thaala Mayam", "Maya Nadhi", "Kadalalle", "Moongil Thottam",
    "Yen Ennai", "Elay Keecha", "Nenjukkul Peidhidum", "Oru Kili", "Kavithai Kelungal", "Mettupodu", "Kaatre En Vaasal"
];

const fullAudioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
];

async function seedARRahman() {
    try {
        console.log("Connecting to WAMP MySQL server...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'music_catalog',
            port: 3306
        });

        console.log("Updating ALL existing songs to use FULL audio URLs instead of 30s previews...");
        const [existingSongs] = await connection.query('SELECT id FROM Songs');
        for (let i = 0; i < existingSongs.length; i++) {
            const url = fullAudioUrls[i % fullAudioUrls.length];
            await connection.query('UPDATE Songs SET file_url = ? WHERE id = ?', [url, existingSongs[i].id]);
        }
        console.log(`Updated ${existingSongs.length} existing songs to full audio.`);

        console.log("Generating and inserting 250 A.R. Rahman songs...");
        
        let generatedCount = 0;
        let iteration = 1;

        while (generatedCount < 250) {
            for (let i = 0; i < arRahmanSongs.length; i++) {
                if (generatedCount >= 250) break;

                const songTitle = iteration === 1 ? arRahmanSongs[i] : `${arRahmanSongs[i]} (Remastered Vol ${iteration})`;
                const url = fullAudioUrls[generatedCount % fullAudioUrls.length];
                const cover = `https://picsum.photos/400?random=${Math.floor(Math.random() * 1000)}`;

                await connection.query(
                    'INSERT INTO Songs (title, artist, album, genre, language, duration, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [songTitle, 'A.R. Rahman', 'A.R. Rahman Hits', 'Melody', 'Tamil', Math.floor(Math.random() * 200) + 180, url, cover]
                );
                
                generatedCount++;
            }
            iteration++;
        }

        console.log(`Successfully inserted ${generatedCount} AR Rahman songs with FULL audio links!`);
        await connection.end();
    } catch (error) {
        console.error("Error updating audio URLs:", error);
    }
}

seedARRahman();
