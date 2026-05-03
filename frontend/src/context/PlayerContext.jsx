import { createContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState({ playedSeconds: 0, loadedSeconds: 0 });
    const [duration, setDuration] = useState(0);

    // Features
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'one' | 'all'
    const [favorites, setFavorites] = useState(() => {
        try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
    });
    const [showLyrics, setShowLyrics] = useState(false);
    const [lyrics, setLyrics] = useState('');
    const [lyricsLoading, setLyricsLoading] = useState(false);

    const audioRef = useRef(new Audio());

    // Save favorites
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Fetch lyrics
    useEffect(() => {
        if (currentSong && showLyrics) {
            fetchLyrics(currentSong.title, currentSong.artist);
        }
    }, [currentSong, showLyrics]);

    const fetchLyrics = async (title, artist) => {
        setLyricsLoading(true);
        setLyrics('');
        try {
            const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
            const data = await res.json();
            setLyrics(data.lyrics || 'Lyrics not found for this song.');
        } catch {
            setLyrics('Could not load lyrics.');
        }
        setLyricsLoading(false);
    };

    // Handle song end
    const handleSongEnd = () => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
            return;
        }
        playNext();
    };

    // Setup audio listeners
    useEffect(() => {
        const audio = audioRef.current;
        const setAudioData = () => setDuration(audio.duration);
        const setAudioTime = () => setProgress({ playedSeconds: audio.currentTime, loadedSeconds: 0 });

        const handleAudioError = (e) => {
            console.error("Audio playback error:", e);
            // Auto-skip to next song if current one fails
            setTimeout(() => playNext(), 2000);
        };

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleSongEnd);
        audio.addEventListener('error', handleAudioError);

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleSongEnd);
            audio.removeEventListener('error', handleAudioError);
        };
    }, [playlist, currentIndex, repeatMode, isShuffle]);

    // Handle volume
    useEffect(() => { audioRef.current.volume = volume; }, [volume]);

    // Handle play/pause
    useEffect(() => {
        if (isPlaying) { audioRef.current.play().catch(console.error); }
        else { audioRef.current.pause(); }
    }, [isPlaying]);

    // Handle song change
    useEffect(() => {
        if (currentSong && currentSong.file_url) {
            const audio = audioRef.current;
            audio.src = currentSong.file_url;
            audio.load();
            audio.play().then(() => setIsPlaying(true)).catch(err => {
                console.error("Playback error:", err);
                setIsPlaying(false);
            });
        }
    }, [currentSong]);

    const playSong = (song, playlistData = []) => {
        // If clicking the same song that is currently active, toggle play/pause
        if (currentSong && currentSong.id === song.id) {
            setIsPlaying(!isPlaying);
            return;
        }

        // If clicking a new song
        if (playlistData.length > 0) {
            setPlaylist(playlistData);
            const index = playlistData.findIndex(s => s.id === song.id);
            setCurrentIndex(index !== -1 ? index : 0);
        }
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const togglePlay = () => { if (currentSong) setIsPlaying(!isPlaying); };

    const playNext = () => {
        if (playlist.length === 0) return;
        let nextIdx = currentIndex + 1;
        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * playlist.length);
        }
        if (nextIdx < playlist.length) {
            setCurrentIndex(nextIdx);
            setCurrentSong(playlist[nextIdx]);
        } else if (repeatMode === 'all') {
            setCurrentIndex(0);
            setCurrentSong(playlist[0]);
        } else {
            setIsPlaying(false);
        }
    };

    const playPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentSong(playlist[currentIndex - 1]);
        } else {
            audioRef.current.currentTime = 0;
        }
    };

    const seekTo = (seconds) => {
        audioRef.current.currentTime = seconds;
        setProgress(prev => ({ ...prev, playedSeconds: seconds }));
    };

    const toggleShuffle = () => setIsShuffle(!isShuffle);
    const cycleRepeat = () => setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
    const toggleFavorite = (song) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.id === song.id);
            return exists ? prev.filter(f => f.id !== song.id) : [...prev, song];
        });
    };
    const isFavorite = (songId) => favorites.some(f => f.id === songId);
    const toggleLyricsPanel = () => setShowLyrics(!showLyrics);

    return (
        <PlayerContext.Provider value={{
            currentSong, isPlaying, setIsPlaying,
            playSong, togglePlay, playNext, playPrevious,
            volume, setVolume, progress, duration, seekTo,
            isShuffle, toggleShuffle,
            repeatMode, cycleRepeat,
            favorites, toggleFavorite, isFavorite,
            showLyrics, toggleLyricsPanel, lyrics, lyricsLoading,
            playlist
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export { PlayerContext, PlayerProvider };



