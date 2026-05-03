import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { FiHeart, FiPlay, FiTrash2 } from 'react-icons/fi';

const Favorites = () => {
    const { favorites, toggleFavorite, playSong, currentSong, isFavorite } = useContext(PlayerContext);

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FiHeart className="text-white text-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
                    <p className="text-gray-400">{favorites.length} song{favorites.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <FiHeart className="text-6xl text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-400 mb-2">No liked songs yet</h2>
                    <p className="text-gray-500 text-sm">Click the ♥ heart on any song in the player to save it here</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-2 text-xs text-gray-400 border-b border-gray-800 uppercase tracking-widest">
                        <span>#</span>
                        <span>Title</span>
                        <span>Artist</span>
                        <span>Remove</span>
                    </div>
                    {favorites.map((song, index) => (
                        <div
                            key={song.id}
                            className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer group items-center ${currentSong?.id === song.id ? 'bg-gray-800 text-spotify-green' : ''}`}
                            onClick={() => playSong(song, favorites)}
                        >
                            <div className="w-6 text-center">
                                <span className="text-gray-400 group-hover:hidden text-sm">{index + 1}</span>
                                <FiPlay className="text-white hidden group-hover:block text-sm" />
                            </div>
                            <div className="flex items-center gap-3 min-w-0">
                                <img 
                                    src={song.cover_url || 'https://via.placeholder.com/40'} 
                                    alt={song.title} 
                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className={`font-semibold truncate text-sm ${currentSong?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>{song.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{song.album || 'Unknown Album'}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(song); }}
                                className="text-gray-600 hover:text-red-400 transition"
                                title="Remove from favorites"
                            >
                                <FiTrash2 className="text-lg" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
