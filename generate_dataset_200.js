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

const extraTitlesTo100 = [
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

const songs101To130 = [
    { title: "New York Nagaram", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Hosanna", artist: "A. R. Rahman", genre: "Romantic" },
    { title: "Po Nee Po", artist: "Anirudh Ravichander", genre: "Emotional" },
    { title: "Oru Devathai", artist: "Yuvan Shankar Raja", genre: "Romantic" },
    { title: "Unakkenna Venum Sollu", artist: "Harris Jayaraj", genre: "Melody" },
    { title: "Ennodu Nee Irundhaal", artist: "A. R. Rahman", genre: "Romantic" },
    { title: "Po Indru Neeyaga", artist: "Anirudh Ravichander", genre: "Melody" },
    { title: "Unna Nenachu", artist: "Ilaiyaraaja", genre: "Classic" },
    { title: "Vizhigalil Oru Vaanavil", artist: "G. V. Prakash Kumar", genre: "Feel-Good" },
    { title: "Kadal Raasa Naan", artist: "A. R. Rahman", genre: "Folk" },
    { title: "Azhagiye", artist: "Anirudh Ravichander", genre: "Romantic" },
    { title: "Ennai Kollathey", artist: "Yuvan Shankar Raja", genre: "Emotional" },
    { title: "Kanave Kanave", artist: "Anirudh Ravichander", genre: "Emotional" },
    { title: "Yaar Intha Saalai Oram", artist: "G. V. Prakash Kumar", genre: "Melody" },
    { title: "Ennai Thalatta Varuvala", artist: "Ilaiyaraaja", genre: "Classic" },
    { title: "Uyirin Uyire", artist: "A. R. Rahman", genre: "Romantic" },
    { title: "Kannum Kannum Nokia", artist: "Harris Jayaraj", genre: "Feel-Good" },
    { title: "Enna Vilai Azhage", artist: "A. R. Rahman", genre: "Classic" },
    { title: "Kadhal Anukkal", artist: "A. R. Rahman", genre: "Melody" },
    { title: "Nenjinile Nenjinile", artist: "A. R. Rahman", genre: "Classic" },
    { title: "Enjoy Enjaami", artist: "Santhosh Narayanan", genre: "Folk" },
    { title: "Vaathi Coming", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Arabic Kuthu", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Kutty Story", artist: "Anirudh Ravichander", genre: "Feel-Good" },
    { title: "Private Party", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Jalabulajangu", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Two Two Two", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Dippam Dappam", artist: "Anirudh Ravichander", genre: "Party" },
    { title: "Mayakkama Kalakkama", artist: "Anirudh Ravichander", genre: "Motivation" },
    { title: "Naan Pizhai", artist: "Anirudh Ravichander", genre: "Melody" }
];

const genericArtists = ["A. R. Rahman", "Harris Jayaraj", "Anirudh Ravichander", "Yuvan Shankar Raja", "Santhosh Narayanan", "D. Imman"];
const genericGenres = ["Melody", "Romantic", "Feel-Good", "Party", "Classic", "Folk"];

let songs = [];
let idCounter = 1;

// 1-20
for (let i = 0; i < baseSongs.length; i++) {
    songs.push({
        id: idCounter,
        title: baseSongs[i].title,
        artist: baseSongs[i].artist,
        language: "Tamil",
        genre: baseSongs[i].genre,
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 30) || 30}.mp3`
    });
    idCounter++;
}

// 21-100
for (let i = 0; i < extraTitlesTo100.length && idCounter <= 100; i++) {
    songs.push({
        id: idCounter,
        title: extraTitlesTo100[i],
        artist: genericArtists[Math.floor(Math.random() * genericArtists.length)],
        language: "Tamil",
        genre: genericGenres[Math.floor(Math.random() * genericGenres.length)],
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 30) || 30}.mp3`
    });
    idCounter++;
}

// 101-130
for (let i = 0; i < songs101To130.length; i++) {
    songs.push({
        id: idCounter,
        title: songs101To130[i].title,
        artist: songs101To130[i].artist,
        language: "Tamil",
        genre: songs101To130[i].genre,
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 30) || 30}.mp3`
    });
    idCounter++;
}

// 131-200
while (idCounter <= 200) {
    songs.push({
        id: idCounter,
        title: `Tamil Hit Track ${idCounter}`,
        artist: genericArtists[Math.floor(Math.random() * genericArtists.length)],
        language: "Tamil",
        genre: genericGenres[Math.floor(Math.random() * genericGenres.length)],
        audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idCounter % 30) || 30}.mp3`
    });
    idCounter++;
}

const data = { songs: songs };

fs.writeFileSync('c:/Users/E VIGNESH/OneDrive/Desktop/dbms/dataset.json', JSON.stringify(data, null, 2));
console.log('Successfully generated dataset.json with 200 songs.');
