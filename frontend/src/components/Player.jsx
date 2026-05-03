import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { 
    FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, 
    FiShuffle, FiRepeat, FiHeart, FiMic, FiX
} from 'react-icons/fi';
import { TbRepeatOnce } from 'react-icons/tb';

const Player = () => {
    const { 
        currentSong, isPlaying, togglePlay, playNext, playPrevious,
        volume, setVolume, progress, duration, seekTo,
        isShuffle, toggleShuffle,
        repeatMode, cycleRepeat,
        toggleFavorite, isFavorite,
        showLyrics, toggleLyricsPanel, lyrics, lyricsLoading
    } = useContext(PlayerContext);

    const handleSeek = (e) => seekTo(parseFloat(e.target.value));

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const repeatIcon = repeatMode === 'one'
        ? <TbRepeatOnce className="text-xl text-spotify-green" />
        : <FiRepeat className={`text-xl ${repeatMode === 'all' ? 'text-spotify-green' : 'text-gray-400'}`} />;

    if (!currentSong) {
        return (
            <div className="h-20 bg-spotify-light border-t border-gray-800 flex items-center justify-center text-gray-500 text-sm">
                🎵 Select a song to start playing
            </div>
        );
    }

    return (
        <>
            {/* Lyrics Panel */}
            {showLyrics && (
                <div className="fixed right-0 bottom-20 w-80 h-[60vh] bg-gray-900 border-l border-gray-800 z-40 flex flex-col shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                        <div>
                            <p className="text-white font-semibold text-sm">{currentSong.title}</p>
                            <p className="text-gray-400 text-xs">{currentSong.artist}</p>
                        </div>
                        <button onClick={toggleLyricsPanel} className="text-gray-400 hover:text-white"><FiX /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {lyricsLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading lyrics...</div>
                        ) : (
                            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{lyrics}</pre>
                        )}
                    </div>
                </div>
            )}

            {/* Player Bar */}
            <div className="h-20 bg-spotify-light border-t border-gray-800 flex items-center justify-between px-6 z-50">
                {/* Song Info + Favorite */}
                <div className="flex items-center space-x-3 w-1/3">
                    <img 
                        src={currentSong.cover_url || "https://via.placeholder.com/56"} 
                        alt={currentSong.title} 
                        className="w-12 h-12 object-cover rounded shadow-lg flex-shrink-0" 
                    />
                    <div className="min-w-0">
                        <h4 className="text-white text-sm font-semibold truncate">{currentSong.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                    </div>
                    <button 
                        onClick={() => toggleFavorite(currentSong)}
                        className="flex-shrink-0 ml-2"
                        title="Add to Favorites"
                    >
                        <FiHeart className={`text-lg transition ${isFavorite(currentSong.id) ? 'text-spotify-green fill-spotify-green' : 'text-gray-400 hover:text-white'}`} />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center w-1/3 space-y-1">
                    <div className="flex items-center space-x-5">
                        {/* Shuffle */}
                        <button onClick={toggleShuffle} title="Shuffle" className="hover:text-white transition">
                            <FiShuffle className={`text-lg ${isShuffle ? 'text-spotify-green' : 'text-gray-400'}`} />
                        </button>
                        {/* Skip Back */}
                        <button onClick={playPrevious} className="text-gray-400 hover:text-white transition">
                            <FiSkipBack className="text-xl" />
                        </button>
                        {/* Play / Pause */}
                        <button 
                            onClick={togglePlay} 
                            className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition shadow"
                        >
                            {isPlaying ? <FiPause className="text-lg" /> : <FiPlay className="text-lg ml-0.5" />}
                        </button>
                        {/* Skip Forward */}
                        <button onClick={playNext} className="text-gray-400 hover:text-white transition">
                            <FiSkipForward className="text-xl" />
                        </button>
                        {/* Repeat */}
                        <button onClick={cycleRepeat} title={`Repeat: ${repeatMode}`} className="hover:text-white transition">
                            {repeatIcon}
                        </button>
                    </div>
                    {/* Seek bar */}
                    <div className="flex items-center space-x-2 w-full max-w-md">
                        <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(progress.playedSeconds)}</span>
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100} 
                            value={progress.playedSeconds || 0}
                            onChange={handleSeek}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-spotify-green"
                        />
                        <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right Side: Volume + Lyrics */}
                <div className="flex items-center justify-end w-1/3 space-x-3">
                    {/* Lyrics Toggle */}
                    <button 
                        onClick={toggleLyricsPanel} 
                        title="Show Lyrics"
                        className={`transition ${showLyrics ? 'text-spotify-green' : 'text-gray-400 hover:text-white'}`}
                    >
                        <FiMic className="text-lg" />
                    </button>
                    {/* Volume */}
                    <FiVolume2 className="text-gray-400 text-lg flex-shrink-0" />
                    <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                </div>
            </div>
        </>
    );
};

export default Player;
