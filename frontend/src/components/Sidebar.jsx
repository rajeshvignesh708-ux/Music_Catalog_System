import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiBook, FiHeart, FiPlus } from 'react-icons/fi';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [playlists, setPlaylists] = useState([]);
    
    const active = (path) => location.pathname === path ? 'text-white' : 'text-gray-400 hover:text-white';

    const fetchPlaylists = async () => {
        if (!user || !user.token) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/playlists/user/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setPlaylists(res.data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [user, location.pathname]); 

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleCreatePlaylist = async () => {
        const name = prompt('Enter playlist name:');
        if (!name) return;
        try {
            await axios.post('http://localhost:5000/api/playlists', { name }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showToast('✨ Playlist created!');
            fetchPlaylists();
        } catch (error) {
            console.error('Create error:', error.response?.data);
            showToast(error.response?.data?.message || 'Error creating playlist', 'error');
        }
    };

    return (
        <div className="w-64 bg-black h-full flex flex-col p-6 space-y-6 flex-shrink-0 relative">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed bottom-24 left-8 z-[100] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce transition-all duration-500 text-sm ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-spotify-green text-black'}`}>
                    <span className="font-bold">{toast.message}</span>
                </div>
            )}
            <div className="text-2xl font-bold text-white flex items-center space-x-2 mb-4">
                <span className="text-spotify-green">🎵</span>
                <span>MusicCatalog</span>
            </div>
            
            <nav className="flex flex-col space-y-2">
                <Link to="/" className={`flex items-center space-x-4 transition font-semibold px-3 py-2 rounded-lg hover:bg-gray-900 ${active('/')}`}>
                    <FiHome className="text-xl" />
                    <span>Home</span>
                </Link>
                <Link to="/search" className={`flex items-center space-x-4 transition font-semibold px-3 py-2 rounded-lg hover:bg-gray-900 ${active('/search')}`}>
                    <FiSearch className="text-xl" />
                    <span>Search</span>
                </Link>
                <Link to="/library" className={`flex items-center space-x-4 transition font-semibold px-3 py-2 rounded-lg hover:bg-gray-900 ${active('/library')}`}>
                    <FiBook className="text-xl" />
                    <span>Your Library</span>
                </Link>
                <Link to="/favorites" className={`flex items-center space-x-4 transition font-semibold px-3 py-2 rounded-lg hover:bg-gray-900 ${active('/favorites')}`}>
                    <FiHeart className={`text-xl ${location.pathname === '/favorites' ? 'text-spotify-green' : ''}`} />
                    <span>Liked Songs</span>
                </Link>
            </nav>

            <div className="mt-4 border-t border-gray-800 pt-4 space-y-2">
                <Link to="/admin" className="flex items-center space-x-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition font-semibold">
                    <span className="text-spotify-green text-lg">＋</span>
                    <span>Add a Song</span>
                </Link>
                <button 
                    onClick={handleCreatePlaylist}
                    className="w-full flex items-center space-x-3 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition font-semibold"
                >
                    <FiPlus className="text-xl" />
                    <span>Create Playlist</span>
                </button>
            </div>

            <div className="mt-4 border-t border-gray-800 pt-4 flex-1 overflow-y-auto">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-4">Playlists</p>
                <div className="space-y-1">
                    {playlists.map(playlist => (
                        <Link 
                            key={playlist.id} 
                            to={`/playlist/${playlist.id}`}
                            className={`block truncate px-3 py-1 text-sm ${location.pathname === `/playlist/${playlist.id}` ? 'text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            {playlist.name}
                        </Link>
                    ))}
                    {playlists.length === 0 && <p className="text-xs text-gray-600 px-3 italic">No playlists yet</p>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
