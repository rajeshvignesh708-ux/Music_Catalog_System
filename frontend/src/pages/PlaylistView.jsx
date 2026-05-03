import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { FiPlay, FiArrowLeft, FiClock, FiTrash2 } from 'react-icons/fi';

const PlaylistView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const { playSong, currentSong } = useContext(PlayerContext);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/playlists/${id}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setPlaylist(res.data.playlist);
                setSongs(res.data.songs || []);
            } catch (error) {
                console.error("Error fetching playlist", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlaylist();
        }
    }, [id, user]);

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleRemoveSong = async (songId, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${id}/remove-song/${songId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setSongs(songs.filter(s => s.id !== songId));
            showToast('🗑️ Removed from playlist');
        } catch (error) {
            showToast(error.response?.data?.message || 'Error removing song', 'error');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading playlist...</div>;
    if (!playlist) return <div className="p-8 text-white">Playlist not found</div>;

    const isOwner = playlist.user_id === user?.id || user?.role === 'admin';

    return (
        <div className="pb-32 relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-24 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse transition-all duration-500 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-spotify-green text-black'}`}>
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}
            <div className="bg-gradient-to-b from-gray-700 to-spotify-base p-8 pt-16 flex items-end gap-6 relative">
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-8 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-80 rounded-full flex items-center justify-center text-white transition"
                >
                    <FiArrowLeft size={20} />
                </button>
                <div className="w-48 h-48 sm:w-56 sm:h-56 shadow-2xl bg-gray-800 flex items-center justify-center rounded-md flex-shrink-0">
                    <span className="text-8xl text-gray-500 font-bold opacity-30">{playlist.name.charAt(0)}</span>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-bold uppercase">Playlist</span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">{playlist.name}</h1>
                    <p className="text-gray-300 text-sm md:text-base">{playlist.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-semibold mt-1">
                        <span>{songs.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {songs.length > 0 && (
                    <div className="mb-6 flex items-center">
                        <button 
                            className="w-14 h-14 bg-spotify-green hover:scale-105 rounded-full flex items-center justify-center text-black shadow-xl transition-transform"
                            onClick={() => playSong(songs[0], songs)}
                        >
                            <FiPlay className="text-2xl ml-1" />
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <div className="grid grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(50px,_50px)_minmax(50px,_50px)] gap-4 px-4 py-2 text-gray-400 border-b border-gray-800 text-sm">
                        <div>#</div>
                        <div>Title</div>
                        <div>Album</div>
                        <div>Language</div>
                        <div className="flex justify-end"><FiClock /></div>
                        <div></div>
                    </div>

                    <div className="flex flex-col mt-2">
                        {songs.map((song, index) => (
                            <div 
                                key={song.id}
                                onClick={() => playSong(song, songs)}
                                className={`grid grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(50px,_50px)_minmax(50px,_50px)] gap-4 px-4 py-3 hover:bg-white hover:bg-opacity-10 rounded-md group cursor-pointer items-center text-sm ${currentSong?.id === song.id ? 'text-spotify-green bg-white bg-opacity-5' : 'text-gray-300'}`}
                            >
                                <div className="text-gray-400">
                                    {currentSong?.id === song.id ? <FiPlay className="text-spotify-green" /> : index + 1}
                                </div>
                                <div className="flex items-center gap-3 truncate">
                                    <img src={song.cover_url} alt={song.title} className="w-10 h-10 object-cover rounded-sm" />
                                    <div className="truncate">
                                        <div className={`truncate ${currentSong?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>{song.title}</div>
                                        <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                    </div>
                                </div>
                                <div className="truncate text-gray-400">{song.album}</div>
                                <div className="truncate text-gray-400">{song.language}</div>
                                <div className="text-gray-400 text-right">{formatDuration(song.duration)}</div>
                                <div className="text-right">
                                    {isOwner && (
                                        <button 
                                            onClick={(e) => handleRemoveSong(song.id, e)}
                                            className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove from playlist"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {songs.length === 0 && (
                            <div className="py-10 text-center text-gray-400">
                                This playlist is empty.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistView;
