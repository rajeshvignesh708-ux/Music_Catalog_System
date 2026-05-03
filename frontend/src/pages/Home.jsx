import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import { FiPlay, FiPlus, FiX, FiTrash2, FiEdit2, FiHeart, FiArrowLeft } from 'react-icons/fi';

const Home = ({ searchMode = false, libraryMode = false }) => {
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [query, setQuery] = useState('');
    const [language, setLanguage] = useState('Tamil');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    
    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    
    const [addForm, setAddForm] = useState({ title: '', artist: '', album: '', genre: '', language: 'Tamil', file_url: '', cover_url: '', duration: 180 });
    const [editForm, setEditForm] = useState({ title: '', artist: '', album: '', genre: '', language: 'Tamil', file_url: '', cover_url: '', duration: 180 });
    const [msg, setMsg] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [activePlaylistMenu, setActivePlaylistMenu] = useState(null); // ID of song whose menu is open
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };
    
    const navigate = useNavigate();
    const { playSong, currentSong } = useContext(PlayerContext);
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'admin';

    const [userPlaylists, setUserPlaylists] = useState([]);
    
    const fetchSongs = async () => {
        try {
            let url = `http://localhost:5000/api/songs?limit=100`;
            if (searchMode && query) url += `&search=${query}`;
            if (language) url += `&language=${language}`;
            if (sortBy) url += `&sortBy=${sortBy}`;
            url += `&sortOrder=${sortOrder}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setSongs(res.data.songs || []);
        } catch (error) {
            console.error("Error fetching songs", error);
        }
    };

    const fetchUserPlaylists = async () => {
        if (!user?.id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/playlists/user/${user.id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setUserPlaylists(res.data || []);
            if (libraryMode) setPlaylists(res.data || []);
        } catch (error) {
            console.error("Error fetching user playlists", error);
        }
    };

    useEffect(() => {
        const fetchGlobalPlaylists = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/playlists/all', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setPlaylists(res.data || []);
            } catch (error) {
                console.error("Error fetching playlists", error);
            }
        };

        fetchUserPlaylists();
        if (!libraryMode) {
            fetchGlobalPlaylists();
            const timeoutId = setTimeout(() => fetchSongs(), 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSongs([]);
        }
    }, [query, searchMode, libraryMode, language, sortBy, sortOrder, user]);

    const handleAddSong = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/songs', addForm, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            showToast('✅ Song added successfully!');
            setAddForm({ title: '', artist: '', album: '', genre: '', language: 'Tamil', file_url: '', cover_url: '', duration: 180 });
            fetchSongs();
            setShowAddModal(false);
        } catch (err) {
            showToast(`❌ ${err.response?.data?.message || 'Error adding song'}`, 'error');
        }
    };

    const handleEditSong = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/songs/${editingSong.id}`, editForm, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            showToast('✅ Song updated successfully!');
            fetchSongs();
            setShowEditModal(false);
            setEditingSong(null);
        } catch (err) {
            showToast(`❌ ${err.response?.data?.message || 'Error updating song'}`, 'error');
        }
    };

    const handleDeleteSong = async (e, songId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to remove this song?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/songs/${songId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setSongs(prev => prev.filter(s => s.id !== songId));
            showToast('🗑️ Song removed successfully');
        } catch (err) {
            showToast('❌ Failed to delete song.', 'error');
        }
    };

    const openEditModal = (e, song) => {
        e.stopPropagation();
        setEditingSong(song);
        setEditForm({
            title: song.title,
            artist: song.artist,
            album: song.album || '',
            genre: song.genre || '',
            language: song.language || 'Tamil',
            file_url: song.file_url,
            cover_url: song.cover_url || '',
            duration: song.duration
        });
        setShowEditModal(true);
    };

    const handleCreatePlaylist = async (name) => {
        if (!name) return;
        try {
            await axios.post('http://localhost:5000/api/playlists', { name }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast('✨ Playlist created!');
            // Refresh ALL user playlists (this updates both the library and the add-to dropdown)
            fetchUserPlaylists();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error creating playlist', 'error');
        }
    };

    const handleDeletePlaylist = async (e, playlistId) => {
        e.stopPropagation();
        if (!window.confirm('Delete this playlist permanently?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/playlists/${playlistId}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            showToast('🗑️ Playlist deleted');
            fetchUserPlaylists();
        } catch (err) {
            showToast('❌ Error deleting playlist', 'error');
        }
    };

    const sectionTitle = language ? `${language} Songs` : 'All Songs';

    return (
        <div className="p-8 pb-32 relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-24 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse transition-all duration-500 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-spotify-green text-black'}`}>
                    <span className="font-bold text-lg">{toast.message}</span>
                </div>
            )}

            {searchMode && (
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="What do you want to listen to?" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full max-w-md px-6 py-3 rounded-full bg-spotify-light text-white focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400"
                    />
                </div>
            )}

            {!libraryMode && (
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {searchMode ? 'Search Results' : 'Discover'}
                    </h2>
                    
                    <div className="flex gap-3 flex-wrap justify-end">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-spotify-light text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-white">
                            <option value="">All Languages</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Hindi">Hindi</option>
                            <option value="English">English</option>
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-spotify-light text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-white">
                            <option value="created_at">Newest</option>
                            <option value="title">Title</option>
                            <option value="artist">Artist</option>
                            <option value="duration">Duration</option>
                        </select>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-spotify-light text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-white">
                            <option value="DESC">Descending ↓</option>
                            <option value="ASC">Ascending ↑</option>
                        </select>

                        {/* Add Song Button - Admin Only */}
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-spotify-green text-black font-bold px-5 py-2 rounded-full hover:scale-105 transition"
                            >
                                <FiPlus className="text-lg" />
                                Add Song
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                    {libraryMode ? 'Your Playlists' : sectionTitle}
                    {!libraryMode && <span className="ml-3 text-sm font-normal text-gray-400">({songs.length} songs)</span>}
                </h2>
            </div>

            {libraryMode ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition text-gray-300 hover:text-white shadow-lg"
                                title="Back to Home"
                            >
                                <FiArrowLeft size={22} />
                            </button>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">
                                    {isAdmin ? 'Management Library' : 'Your Library'}
                                </h2>
                                <p className="text-gray-400 text-sm font-medium mt-1">
                                    {isAdmin ? 'Manage all playlists and global music catalog' : 'Your personal collection of music and playlists'}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                const name = prompt('Enter playlist name:');
                                if (name) handleCreatePlaylist(name);
                            }}
                            className="bg-white text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition flex items-center gap-2 shadow-xl"
                        >
                            <FiPlus size={20} />
                            <span>Create Playlist</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {/* Featured "Liked Songs" Card */}
                        <div 
                            onClick={() => navigate('/favorites')}
                            className="col-span-2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-8 rounded-2xl hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all cursor-pointer group relative flex flex-col justify-end min-h-[220px] border border-white/10"
                        >
                            <div className="absolute top-6 left-6 bg-white/20 p-3 rounded-xl backdrop-blur-md">
                                <FiHeart className="text-white fill-white" size={24} />
                            </div>
                            <h3 className="text-4xl font-black text-white mb-2">Liked Songs</h3>
                            <p className="text-white text-opacity-90 font-bold tracking-wide">Your favorite sounds in one place</p>
                            <div className="absolute bottom-6 right-6 w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <FiPlay className="ml-1 text-2xl" />
                            </div>
                        </div>

                        {(isAdmin ? playlists : userPlaylists).map(playlist => (
                            <div key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} className="bg-spotify-light p-4 rounded-xl hover:bg-gray-800 transition-all cursor-pointer group relative border border-transparent hover:border-gray-700 shadow-lg">
                                {/* Delete Playlist Button - Only if owner or admin */}
                                {(playlist.user_id === user?.id || isAdmin) && (
                                    <button 
                                        onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                                        className="absolute top-2 right-2 z-20 w-8 h-8 bg-red-600 bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        title="Delete Playlist"
                                    >
                                        <FiTrash2 className="text-sm" />
                                    </button>
                                )}
                                <div className="relative mb-4 pb-[100%] overflow-hidden rounded-lg shadow-inner bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center group-hover:shadow-2xl transition-all">
                                    <span className="absolute text-5xl text-white font-black opacity-10 group-hover:opacity-20 transition-opacity uppercase">{playlist.name.charAt(0)}</span>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                        <FiPlay className="ml-1 text-lg" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-white truncate text-lg">{playlist.name}</h3>
                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-tighter">Playlist • {isAdmin ? 'Global' : 'Personal'}</p>
                            </div>
                        ))}
                    </div>

                    {playlists.length === 0 && (
                        <div className="text-center py-24 bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-800 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-600">
                                <FiPlus size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">Begin your collection</h3>
                            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Create your first playlist and start building your ultimate music library.</p>
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-spotify-green text-black font-black px-10 py-4 rounded-full hover:scale-110 transition shadow-xl"
                            >
                                Discover New Tracks
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {songs.map(song => (
                        <div key={song.id} className={`bg-spotify-light p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer group relative ${currentSong?.id === song.id ? 'ring-2 ring-spotify-green' : ''}`} onClick={() => playSong(song, songs)}>
                            
                            {/* Management Actions Overlay - Admin Only */}
                            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                {/* Add to Playlist (Always available) */}
                                <div className="relative">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActivePlaylistMenu(activePlaylistMenu === song.id ? null : song.id);
                                        }} 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${activePlaylistMenu === song.id ? 'bg-spotify-green text-black scale-110' : 'bg-gray-900 bg-opacity-80 text-white hover:bg-spotify-green hover:text-black'}`}
                                        title="Add to Playlist"
                                    >
                                        <FiPlus />
                                    </button>
                                    
                                    {activePlaylistMenu === song.id && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in zoom-in duration-200">
                                            <p className="px-4 py-3 text-[10px] font-black text-gray-400 border-b border-gray-800 uppercase tracking-widest">Add to Your Playlist</p>
                                            <div className="max-h-56 overflow-y-auto">
                                                {(isAdmin ? playlists : userPlaylists).map(p => (
                                                    <button key={p.id} onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await axios.post(`http://localhost:5000/api/playlists/${p.id}/add-song`, { songId: song.id }, { headers: { Authorization: `Bearer ${user?.token}` }});
                                                            showToast(`🎵 Added to ${p.name}`);
                                                            setActivePlaylistMenu(null);
                                                        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
                                                    }} className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-spotify-green hover:text-black transition-colors font-bold border-b border-gray-800 last:border-0 flex items-center justify-between group/item">
                                                        <span>{p.name}</span>
                                                        <FiPlus className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                                {userPlaylists.length === 0 && (
                                                    <div className="p-4 text-center">
                                                        <p className="text-xs text-gray-500 italic mb-3">No playlists yet</p>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const name = prompt('New Playlist Name:');
                                                                if (name) handleCreatePlaylist(name);
                                                            }}
                                                            className="text-[10px] font-black text-spotify-green hover:underline uppercase tracking-tighter"
                                                        >
                                                            + Create Now
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {isAdmin && (
                                    <>
                                        <button onClick={(e) => openEditModal(e, song)} className="w-8 h-8 bg-blue-600 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-blue-500 hover:scale-110 transition" title="Edit song">
                                            <FiEdit2 className="text-xs" />
                                        </button>
                                        <button onClick={(e) => handleDeleteSong(e, song.id)} className="w-8 h-8 bg-red-600 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:scale-110 transition" title="Remove song">
                                            <FiTrash2 className="text-xs" />
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="relative mb-4 pb-[100%] overflow-hidden rounded-md shadow-lg">
                                <img src={song.cover_url || "https://via.placeholder.com/150"} alt={song.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                                <div className={`absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ${currentSong?.id === song.id ? 'opacity-100 translate-y-0' : ''}`}>
                                    <FiPlay className="text-xl ml-1" />
                                </div>
                            </div>
                            <h3 className="font-bold text-white truncate">{song.title}</h3>
                            <p className="text-sm text-gray-400 truncate mt-1">{song.artist}</p>
                            {song.language && <span className="text-xs px-2 py-1 mt-2 inline-block bg-gray-700 rounded-full text-gray-300">{song.language}</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modals */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"><FiX /></button>
                        <h2 className="text-2xl font-bold text-white mb-6">{showEditModal ? 'Edit Song' : 'Add New Song'}</h2>
                        <form onSubmit={showEditModal ? handleEditSong : handleAddSong} className="flex flex-col gap-4">
                            <input required placeholder="Song Title *" value={showEditModal ? editForm.title : addForm.title} onChange={e => showEditModal ? setEditForm({...editForm, title: e.target.value}) : setAddForm({...addForm, title: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            <input required placeholder="Artist *" value={showEditModal ? editForm.artist : addForm.artist} onChange={e => showEditModal ? setEditForm({...editForm, artist: e.target.value}) : setAddForm({...addForm, artist: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            <input placeholder="Album" value={showEditModal ? editForm.album : addForm.album} onChange={e => showEditModal ? setEditForm({...editForm, album: e.target.value}) : setAddForm({...addForm, album: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            <select value={showEditModal ? editForm.language : addForm.language} onChange={e => showEditModal ? setEditForm({...editForm, language: e.target.value}) : setAddForm({...addForm, language: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green">
                                <option value="Tamil">Tamil</option>
                                <option value="Hindi">Hindi</option>
                                <option value="English">English</option>
                            </select>
                            <input required placeholder="Audio URL *" value={showEditModal ? editForm.file_url : addForm.file_url} onChange={e => showEditModal ? setEditForm({...editForm, file_url: e.target.value}) : setAddForm({...addForm, file_url: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            <input placeholder="Cover Image URL" value={showEditModal ? editForm.cover_url : addForm.cover_url} onChange={e => showEditModal ? setEditForm({...editForm, cover_url: e.target.value}) : setAddForm({...addForm, cover_url: e.target.value})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            <input type="number" placeholder="Duration (sec)" value={showEditModal ? editForm.duration : addForm.duration} onChange={e => showEditModal ? setEditForm({...editForm, duration: parseInt(e.target.value)}) : setAddForm({...addForm, duration: parseInt(e.target.value)})} className="bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-spotify-green" />
                            {msg && <p className="text-center font-semibold text-sm py-1">{msg}</p>}
                            <button type="submit" className="bg-spotify-green text-black font-bold py-3 rounded-full hover:scale-105 transition mt-2">{showEditModal ? 'Update Song' : 'Add Song'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
