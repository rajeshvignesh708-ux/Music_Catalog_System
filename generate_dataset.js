const fs = require('fs');

const baseSongs = [
    { title: "Kannave Kannave", artist: "D. Imman", genre: "Romantic" },
    { title: "Munbe Vaa", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Vaseegara", artist: "Harris Jayaraj", genre: "Romantic" },
    { title: "Anbil Avan", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Thalli Pogathey", artist: "A. R. Rahman", genre: "Romantic" },
    { title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj", genre: "Melody" },
    { title: "Pachai Nirame", artist: "A. R. Rahman", genre: "Romantic" },
    { title: "Kaathalae Kaathalae", artist: "Govind Vasantha", genre: "Melody" },
    { title: "Maruvaarthai", artist: "Darbuka Siva", genre: "Romantic" },
    { title: "Yaanji", artist: "Sam C. S.", genre: "Melody" },
    { title: "Rowdy Baby", artist: "Yuvan Shankar Raja", genre: "Feel-Good" },
    { title: "Megham Karukatha", artist: "Anirudh Ravichander", genre: "Feel-Good" },
    { title: "Adiye", artist: "G. V. Prakash Kumar", genre: "Romantic" },
    { title: "Innum Konjam Naeram", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Nee Kavithaigala", artist: "D. Imman", genre: "Romantic" },
    { title: "Vennilave Vennilave", artist: "A. R. Rahman", genre: "Classic" },
    { title: "Poongatrile", artist: "A. R. Rahman", genre: "Classic" },
    { title: "Aaromale", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Ennavale Adi Ennavale", artist: "A. R. Rahman", genre: "Classic" },
    { title: "Snehithane", artist: "A. R. Rahman", genre: "Melody" }
];

// Additional titles to reach 100
const extraTitles = [
    "Oru Maalai", "Malare", "Thendral Vandhu", "Usure Pogudhey", "Ava Enna", "Pookkal Pookkum", 
    "Kangal Irandal", "Mun Andhi", "Venmegam", "En Kadhal Solla", "Azhage Azhage", "Thuli Thuli", 
    "Othaiyadi Pathayila", "Ennai Konjam Maatri", "Mazhai Kuruvi", "Po Nee Po", "Oru Devathai", 
    "Suttrum Vizhi", "Idhazhin Oram", "Unakkenna Venum Sollu", "Anbae Peranbae", "Kannamma", 
    "Oxygen", "Vaan Varuvaan", "High On Love", "Kadhal Kan Kattudhe", "Sahaayane", "Kuru Kuru", 
    "Nila Kaigirathu", "Uyire Uyire", "Anjali Anjali", "Minsara Kanna", "Hosanna", "Pudhu Vellai Mazhai", 
    "Kappaleri Poyaachu", "Ennodu Nee Irundhaal", "Mental Manadhil", "Neethanae", "Aalaporan Thamizhan", 
    "Maruthaani", "Maduraikku Pogathadee", "Balleilakka", "Sahana", "Vaaji Vaaji", "Athiradee", 
    "Sivaji", "Enthaaraa Enthaaraa", "Nenjukkule", "Narumugaye", "Kannalane", "Oruvan Oruvan", 
    "Muthu Mazhai", "Thirakkadha", "Swasame", "Rasaali", "Showkali", "Idhu Naal", "Hayati", 
    "Kurumba", "Poraadalaam", "Kalvare", "Vinnaithaandi Varuvaaya", "Kannukkul Kannai", "Evano Oruvan", 
    "Kadhal Sadugudu", "Pachai Kiligal", "Oru Deivam Thandha", "Mun Paniya", "Omana Penne", 
    "Kaadhal Rojave", "Chinna Chinna Aasai", "Putham Pudhu Bhoomi", "Thamizha Thamizha", "Anbendra", 
    "Thiruda Thiruda", "Veerapandi", "Konjam Nilavu", "Rasathi", "Chandiranai Thottathu", "Margazhi Poove"
];

let songs = [];
let idCounter = 1;

// First add the 20 base ones
for (let i = 0; i < baseSongs.length; i++) {
    songs.push({
        id: idCounter,
        title: baseSongs[i].title,
        artist: baseSongs[i].artist,
        language: "Tamil",
        genre: baseSongs[i].genre,
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 16) + 1}.mp3`
    });
    idCounter++;
}

// Then fill up to 100
for (let i = 0; i < extraTitles.length && idCounter <= 100; i++) {
    songs.push({
        id: idCounter,
        title: extraTitles[i],
        artist: ["A. R. Rahman", "Harris Jayaraj", "Anirudh Ravichander", "Yuvan Shankar Raja", "D. Imman", "G. V. Prakash Kumar"][Math.floor(Math.random() * 6)],
        language: "Tamil",
        genre: ["Melody", "Romantic", "Feel-Good", "Classic"][Math.floor(Math.random() * 4)],
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 16) + 1}.mp3`
    });
    idCounter++;
}

const data = { songs: songs };

fs.writeFileSync('c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json', JSON.stringify(data, null, 2));
console.log('Successfully generated dataset.json with 100 songs.');
